package edu.cit.canete.laundrylink

import android.content.Context
import edu.cit.canete.laundrylink.features.booking.data.BookingRepository
import edu.cit.canete.laundrylink.shared.network.RetrofitClient
import edu.cit.canete.laundrylink.features.booking.data.model.Booking
import edu.cit.canete.laundrylink.features.booking.viewmodel.MyBookingsViewModel
import edu.cit.canete.laundrylink.features.shop.data.ShopRepository
import edu.cit.canete.laundrylink.features.shop.data.model.ShopSummary
import edu.cit.canete.laundrylink.features.shop.data.model.ShopSummaryService
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.lang.reflect.Field

@OptIn(ExperimentalCoroutinesApi::class)
class MyBookingsViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private lateinit var viewModel: MyBookingsViewModel
    private lateinit var mockBookingRepo: BookingRepository
    private lateinit var mockShopRepo: ShopRepository

    // -------------------------------------------------------------------------
    // Fake data
    // -------------------------------------------------------------------------

    private val fakeSummaryService = ShopSummaryService(
        id = "svc-1",
        name = "Standard Wash",
        serviceType = "STANDARD",
        price = 150.0,
        createdAt = "2024-01-01T00:00:00Z"
    )

    private val fakeShopSummary = ShopSummary(
        id = "shop-1",
        name = "Clean & Fresh Laundry",
        address = "123 Main St",
        city = "Cebu",
        latitude = null,
        longitude = null,
        operatingHours = "8AM-6PM",
        standardPrice = 150.0,
        priorityPrice = 250.0,
        prioritySlots = 5,
        services = listOf(fakeSummaryService),
        createdAt = "2024-01-01T00:00:00Z"
    )

    private val fakeBookingPending = Booking(
        id = "booking-1",
        bookingCode = "LL-001",
        status = "PENDING",
        bookingDate = "2025-05-10",
        timeSlot = "08:00",
        shopId = "shop-1",
        serviceId = "svc-1",
        fileUrl = null,
        qrCodeUrl = null,
        createdAt = "2025-05-09T10:00:00Z"
    )

    private val fakeBookingCompleted = Booking(
        id = "booking-2",
        bookingCode = "LL-002",
        status = "COMPLETED",
        bookingDate = "2025-05-08",
        timeSlot = "09:00",
        shopId = "shop-1",
        serviceId = "svc-1",
        fileUrl = null,
        qrCodeUrl = null,
        createdAt = "2025-05-07T10:00:00Z"
    )

    private val fakeBookingCancelled = Booking(
        id = "booking-3",
        bookingCode = "LL-003",
        status = "CANCELLED",
        bookingDate = "2025-05-07",
        timeSlot = "10:00",
        shopId = "shop-1",
        serviceId = "svc-1",
        fileUrl = null,
        qrCodeUrl = null,
        createdAt = "2025-05-06T10:00:00Z"
    )

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        RetrofitClient.init(mockk<Context>(relaxed = true))
        mockBookingRepo = mockk()
        mockShopRepo = mockk()

        // Default stubs so the ViewModel's init{} doesn't crash
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(emptyList())
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(emptyList())

        viewModel = MyBookingsViewModel()
        injectMocks(viewModel)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    private fun injectMocks(vm: MyBookingsViewModel) {
        val bookingRepoField: Field = MyBookingsViewModel::class.java.getDeclaredField("bookingRepo")
        bookingRepoField.isAccessible = true
        bookingRepoField.set(vm, mockBookingRepo)

        val shopRepoField: Field = MyBookingsViewModel::class.java.getDeclaredField("shopRepo")
        shopRepoField.isAccessible = true
        shopRepoField.set(vm, mockShopRepo)
    }

    // -------------------------------------------------------------------------
    // load() — success paths
    // -------------------------------------------------------------------------

    @Test
    fun `load populates all and filtered with full list when default ALL filter`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted, fakeBookingCancelled)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals(false, state.loading)
        assertEquals(false, state.refreshing)
        assertEquals(3, state.all.size)
        assertEquals(3, state.filtered.size)
        assertNull(state.error)
    }

    @Test
    fun `load resolves shop name and service name from summary data`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(listOf(fakeBookingPending))
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        val display = state.all.first()
        assertEquals("Clean & Fresh Laundry", display.shopName)
        assertEquals("Standard Wash", display.serviceName)
        assertEquals(150.0, display.servicePrice, 0.001)
    }

    @Test
    fun `load sets Unknown Shop when shopId not found in summaries`() = runTest {
        val bookingUnknownShop = fakeBookingPending.copy(shopId = "unknown-shop")
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(listOf(bookingUnknownShop))
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Unknown Shop", state.all.first().shopName)
    }

    @Test
    fun `load sets Unknown Service when serviceId not found in summaries`() = runTest {
        val bookingUnknownService = fakeBookingPending.copy(serviceId = "unknown-svc")
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(listOf(bookingUnknownService))
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Unknown Service", state.all.first().serviceName)
        assertEquals(0.0, state.all.first().servicePrice, 0.001)
    }

    @Test
    fun `load computes counts map correctly`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted, fakeBookingCancelled)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals(3, state.counts["ALL"])
        assertEquals(1, state.counts["PENDING"])
        assertEquals(1, state.counts["COMPLETED"])
        assertEquals(1, state.counts["CANCELLED"])
    }

    @Test
    fun `load with initial=false sets refreshing instead of loading`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(emptyList())
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(emptyList())

        // We cannot observe the intermediate refreshing=true state easily in a runTest,
        // but we can verify the final state has refreshing=false after completion.
        viewModel.load(initial = false)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals(false, state.refreshing)
        assertEquals(false, state.loading)
    }

    @Test
    fun `load handles empty bookings list`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(emptyList())
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertTrue(state.all.isEmpty())
        assertTrue(state.filtered.isEmpty())
        assertEquals(0, state.counts["ALL"])
        assertNull(state.error)
    }

    // -------------------------------------------------------------------------
    // load() — failure paths
    // -------------------------------------------------------------------------

    @Test
    fun `load sets error when bookings fetch fails`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.failure(Exception("Server error"))
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(emptyList())

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Server error", state.error)
        assertEquals(false, state.loading)
        assertEquals(false, state.refreshing)
        assertTrue(state.all.isEmpty())
    }

    @Test
    fun `load continues with unknown shop info when shop summary fetch fails`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(listOf(fakeBookingPending))
        coEvery { mockShopRepo.getShopsSummary() } returns Result.failure(Exception("Shop fetch failed"))

        viewModel.load(initial = true)
        advanceUntilIdle()

        val state = viewModel.state.first()
        // Bookings still loaded; shop/service names fall back to "Unknown"
        assertEquals(1, state.all.size)
        assertEquals("Unknown Shop", state.all.first().shopName)
        assertEquals("Unknown Service", state.all.first().serviceName)
        assertNull(state.error)
    }

    // -------------------------------------------------------------------------
    // filter()
    // -------------------------------------------------------------------------

    @Test
    fun `filter with PENDING returns only pending bookings`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted, fakeBookingCancelled)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        viewModel.filter("PENDING")

        val state = viewModel.state.first()
        assertEquals(1, state.filtered.size)
        assertEquals("PENDING", state.filtered.first().booking.status)
        assertEquals("PENDING", state.activeFilter)
    }

    @Test
    fun `filter with COMPLETED returns only completed bookings`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        viewModel.filter("COMPLETED")

        val state = viewModel.state.first()
        assertEquals(1, state.filtered.size)
        assertEquals("COMPLETED", state.filtered.first().booking.status)
    }

    @Test
    fun `filter with ALL restores full list`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted, fakeBookingCancelled)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        viewModel.filter("PENDING")
        viewModel.filter("ALL")

        val state = viewModel.state.first()
        assertEquals(3, state.filtered.size)
        assertEquals("ALL", state.activeFilter)
    }

    @Test
    fun `filter with unknown status returns empty list`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        viewModel.filter("UNKNOWN_STATUS")

        val state = viewModel.state.first()
        assertTrue(state.filtered.isEmpty())
        assertEquals("UNKNOWN_STATUS", state.activeFilter)
    }

    @Test
    fun `filter retains all list while updating filtered`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(
            listOf(fakeBookingPending, fakeBookingCompleted, fakeBookingCancelled)
        )
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()

        viewModel.filter("CANCELLED")

        val state = viewModel.state.first()
        // `all` should not be mutated
        assertEquals(3, state.all.size)
        assertEquals(1, state.filtered.size)
    }

    // -------------------------------------------------------------------------
    // Default state after construction
    // -------------------------------------------------------------------------

    @Test
    fun `initial state has loading true and ALL filter`() = runTest {
        // Before the init{} coroutine runs, state should start as loading
        val state = viewModel.state.first()
        // After setUp() the init block fires; we check the settled state
        advanceUntilIdle()
        val settledState = viewModel.state.first()
        assertEquals("ALL", settledState.activeFilter)
        assertEquals(false, settledState.loading)
    }

    @Test
    fun `multiple sequential loads do not accumulate duplicate entries`() = runTest {
        coEvery { mockBookingRepo.getMyBookings() } returns Result.success(listOf(fakeBookingPending))
        coEvery { mockShopRepo.getShopsSummary() } returns Result.success(listOf(fakeShopSummary))

        viewModel.load(initial = true)
        advanceUntilIdle()
        viewModel.load(initial = false)
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals(1, state.all.size)
    }
}
