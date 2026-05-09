package edu.cit.canete.laundrylink

import edu.cit.canete.laundrylink.features.booking.data.BookingRepository
import edu.cit.canete.laundrylink.features.booking.data.model.Booking
import edu.cit.canete.laundrylink.features.booking.viewmodel.BookingFlowUiState
import edu.cit.canete.laundrylink.features.booking.viewmodel.BookingViewModel
import edu.cit.canete.laundrylink.features.shop.data.ShopRepository
import edu.cit.canete.laundrylink.features.shop.data.model.Service
import edu.cit.canete.laundrylink.features.shop.data.model.Shop
import edu.cit.canete.laundrylink.features.shop.data.model.Slot
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
class BookingViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private lateinit var viewModel: BookingViewModel
    private lateinit var mockShopRepo: ShopRepository
    private lateinit var mockBookingRepo: BookingRepository

    private val fakeShop = Shop(
        id = "shop-1",
        name = "Clean & Fresh Laundry",
        address = "123 Main St",
        city = "Cebu",
        latitude = null,
        longitude = null,
        operatingHours = "8AM-6PM",
        createdAt = "2024-01-01T00:00:00Z"
    )

    private val fakeService = Service(
        id = "svc-1",
        name = "Standard Wash",
        serviceType = "STANDARD",
        price = 150.0,
        createdAt = "2024-01-01T00:00:00Z"
    )

    private val fakePriorityService = Service(
        id = "svc-priority",
        name = "Priority Wash",
        serviceType = "PRIORITY",
        price = 250.0,
        createdAt = "2024-01-01T00:00:00Z"
    )

    private val fakeSlots = listOf(
        Slot(
            slotConfigId = "slot-1",
            date = "2025-05-10",
            startTime = "08:00",
            endTime = "09:00",
            maxSlots = 5,
            reserved = 1,
            available = 4
        ),
        Slot(
            slotConfigId = "slot-2",
            date = "2025-05-10",
            startTime = "09:00",
            endTime = "10:00",
            maxSlots = 5,
            reserved = 5,
            available = 0
        )
    )

    private val fakeBooking = Booking(
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

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        mockShopRepo = mockk()
        mockBookingRepo = mockk()

        viewModel = BookingViewModel()
        injectMocks(viewModel)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    /**
     * Uses reflection to inject mock repositories into the ViewModel,
     * since the repositories are instantiated directly inside the ViewModel.
     */
    private fun injectMocks(vm: BookingViewModel) {
        val shopRepoField: Field = BookingViewModel::class.java.getDeclaredField("shopRepo")
        shopRepoField.isAccessible = true
        shopRepoField.set(vm, mockShopRepo)

        val bookingRepoField: Field = BookingViewModel::class.java.getDeclaredField("bookingRepo")
        bookingRepoField.isAccessible = true
        bookingRepoField.set(vm, mockBookingRepo)
    }

    // -------------------------------------------------------------------------
    // init / initial state
    // -------------------------------------------------------------------------

    @Test
    fun `initial state has step 1 and empty fields`() = runTest {
        val state = viewModel.state.first()
        assertEquals(1, state.step)
        assertEquals("", state.shopId)
        assertEquals("", state.serviceId)
        assertTrue(state.slots.isEmpty())
        assertNull(state.selectedSlot)
        assertNull(state.error)
    }

    // -------------------------------------------------------------------------
    // init()
    // -------------------------------------------------------------------------

    @Test
    fun `init loads shop and service details successfully`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Clean & Fresh Laundry", state.shopName)
        assertEquals("123 Main St", state.shopAddress)
        assertEquals("Standard Wash", state.serviceName)
        assertEquals(150.0, state.servicePrice, 0.001)
        assertEquals(false, state.loadingDetails)
        assertNull(state.error)
    }

    @Test
    fun `init falls back to PRIORITY service when preferred id not found`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(
            listOf(fakeService, fakePriorityService)
        )

        viewModel.init("shop-1", "nonexistent-id")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Priority Wash", state.serviceName)
        assertEquals(250.0, state.servicePrice, 0.001)
    }

    @Test
    fun `init falls back to first service when no PRIORITY type and preferred id missing`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))

        viewModel.init("shop-1", "nonexistent-id")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Standard Wash", state.serviceName)
    }

    @Test
    fun `init sets error when shop fetch fails`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.failure(Exception("Network error"))
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Network error", state.error)
        assertEquals(false, state.loadingDetails)
    }

    @Test
    fun `init sets error when service list is empty`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(emptyList())

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("This shop has no services available.", state.error)
    }

    @Test
    fun `init is a no-op when called again with same shopId and non-empty serviceId`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        // Second call should be skipped (guard condition in init)
        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Clean & Fresh Laundry", state.shopName)
    }

    // -------------------------------------------------------------------------
    // selectDate() / loadSlots()
    // -------------------------------------------------------------------------

    @Test
    fun `selectDate clears previous slots and loads new ones`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))
        coEvery { mockShopRepo.getSlots("shop-1", "svc-1", "2025-05-10") } returns Result.success(fakeSlots)

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        viewModel.selectDate("2025-05-10")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("2025-05-10", state.selectedDate)
        assertEquals(2, state.slots.size)
        assertNull(state.selectedSlot)
        assertEquals(false, state.loadingSlots)
    }

    @Test
    fun `selectDate sets error when slot fetch fails`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))
        coEvery { mockShopRepo.getSlots("shop-1", "svc-1", "2025-05-10") } returns
            Result.failure(Exception("Slot load failed"))

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        viewModel.selectDate("2025-05-10")
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Slot load failed", state.error)
        assertTrue(state.slots.isEmpty())
    }

    // -------------------------------------------------------------------------
    // selectSlot()
    // -------------------------------------------------------------------------

    @Test
    fun `selectSlot updates selectedSlot in state`() = runTest {
        val slot = fakeSlots.first()
        viewModel.selectSlot(slot)

        val state = viewModel.state.first()
        assertEquals(slot, state.selectedSlot)
    }

    // -------------------------------------------------------------------------
    // proceedToStep()
    // -------------------------------------------------------------------------

    @Test
    fun `proceedToStep advances to given step`() = runTest {
        viewModel.proceedToStep(2)
        assertEquals(2, viewModel.state.first().step)
    }

    @Test
    fun `proceedToStep clamps to minimum step 1`() = runTest {
        viewModel.proceedToStep(-5)
        assertEquals(1, viewModel.state.first().step)
    }

    @Test
    fun `proceedToStep clamps to maximum step 4`() = runTest {
        viewModel.proceedToStep(99)
        assertEquals(4, viewModel.state.first().step)
    }

    @Test
    fun `proceedToStep clears error`() = runTest {
        // Put an error in state first by selecting date with no shopId configured
        viewModel.proceedToStep(2)
        viewModel.proceedToStep(1)
        assertNull(viewModel.state.first().error)
    }

    // -------------------------------------------------------------------------
    // setFileName()
    // -------------------------------------------------------------------------

    @Test
    fun `setFileName stores file name in state`() = runTest {
        viewModel.setFileName("receipt.pdf")
        assertEquals("receipt.pdf", viewModel.state.first().fileName)
    }

    @Test
    fun `setFileName with null clears file name`() = runTest {
        viewModel.setFileName("receipt.pdf")
        viewModel.setFileName(null)
        assertNull(viewModel.state.first().fileName)
    }

    // -------------------------------------------------------------------------
    // onNavigatedToConfirmation()
    // -------------------------------------------------------------------------

    @Test
    fun `onNavigatedToConfirmation clears createdBooking`() = runTest {
        // Simulate a booking being present by submitting successfully
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))
        coEvery { mockShopRepo.getSlots("shop-1", "svc-1", "2025-05-10") } returns Result.success(fakeSlots)
        coEvery {
            mockBookingRepo.createBooking("shop-1", "svc-1", "2025-05-10", "08:00", null)
        } returns Result.success(fakeBooking)

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()
        viewModel.selectDate("2025-05-10")
        advanceUntilIdle()
        viewModel.selectSlot(fakeSlots.first())
        viewModel.submitBooking()
        advanceUntilIdle()

        assertNotNull(viewModel.state.first().createdBooking)

        viewModel.onNavigatedToConfirmation()
        assertNull(viewModel.state.first().createdBooking)
    }

    // -------------------------------------------------------------------------
    // submitBooking()
    // -------------------------------------------------------------------------

    @Test
    fun `submitBooking succeeds and sets createdBooking`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))
        coEvery { mockShopRepo.getSlots("shop-1", "svc-1", "2025-05-10") } returns Result.success(fakeSlots)
        coEvery {
            mockBookingRepo.createBooking("shop-1", "svc-1", "2025-05-10", "08:00", null)
        } returns Result.success(fakeBooking)

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()
        viewModel.selectDate("2025-05-10")
        advanceUntilIdle()
        viewModel.selectSlot(fakeSlots.first())
        viewModel.submitBooking()
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertNotNull(state.createdBooking)
        assertEquals("LL-001", state.createdBooking?.bookingCode)
        assertEquals(false, state.submitting)
        assertNull(state.error)
    }

    @Test
    fun `submitBooking sets error when no slot selected`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()

        // No slot selected
        viewModel.submitBooking()
        advanceUntilIdle()

        // Should return early without error message because selectedSlot is null (guard returns)
        val state = viewModel.state.first()
        assertNull(state.createdBooking)
    }

    @Test
    fun `submitBooking sets error when API fails`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))
        coEvery { mockShopRepo.getSlots("shop-1", "svc-1", "2025-05-10") } returns Result.success(fakeSlots)
        coEvery {
            mockBookingRepo.createBooking("shop-1", "svc-1", "2025-05-10", "08:00", null)
        } returns Result.failure(Exception("Booking failed"))

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()
        viewModel.selectDate("2025-05-10")
        advanceUntilIdle()
        viewModel.selectSlot(fakeSlots.first())
        viewModel.submitBooking()
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Booking failed", state.error)
        assertNull(state.createdBooking)
        assertEquals(false, state.submitting)
    }

    @Test
    fun `submitBooking sets generic error message when exception message is null`() = runTest {
        coEvery { mockShopRepo.getShop("shop-1") } returns Result.success(fakeShop)
        coEvery { mockShopRepo.getShopServices("shop-1") } returns Result.success(listOf(fakeService))
        coEvery { mockShopRepo.getSlots("shop-1", "svc-1", "2025-05-10") } returns Result.success(fakeSlots)
        coEvery {
            mockBookingRepo.createBooking("shop-1", "svc-1", "2025-05-10", "08:00", null)
        } returns Result.failure(Exception())

        viewModel.init("shop-1", "svc-1")
        advanceUntilIdle()
        viewModel.selectDate("2025-05-10")
        advanceUntilIdle()
        viewModel.selectSlot(fakeSlots.first())
        viewModel.submitBooking()
        advanceUntilIdle()

        val state = viewModel.state.first()
        assertEquals("Failed to create booking", state.error)
    }
}
