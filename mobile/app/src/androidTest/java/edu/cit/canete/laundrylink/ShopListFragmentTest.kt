package edu.cit.canete.laundrylink

import androidx.fragment.app.testing.launchFragmentInContainer
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.action.ViewActions.typeText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import edu.cit.canete.laundrylink.features.shop.ui.ShopListFragment
import org.hamcrest.Matchers.not
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumented UI tests for [ShopListFragment].
 *
 * The fragment is launched in isolation via [launchFragmentInContainer] using the
 * default app theme so view binding, RecyclerView, and search field render correctly.
 *
 * Note: Because [ShopListFragment] calls [ShopRepository] directly (no DI) these
 * tests focus on the UI scaffolding and local client-side behaviour (search field,
 * error / progress visibility) rather than end-to-end network flows.  Integration
 * tests that verify real data loading should be run against a local mock server.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class ShopListFragmentTest {

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Launch ShopListFragment in a container with the app theme. */
    private fun launchShopList() =
        launchFragmentInContainer<ShopListFragment>(
            themeResId = R.style.Theme_LaundryLink
        )

    // -------------------------------------------------------------------------
    // Initial view visibility
    // -------------------------------------------------------------------------

    @Test
    fun shopListFragment_searchField_isDisplayed() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .check(matches(isDisplayed()))
    }

    @Test
    fun shopListFragment_recyclerView_isDisplayed() {
        launchShopList()
        onView(withId(R.id.rvShops))
            .check(matches(isDisplayed()))
    }

    @Test
    fun shopListFragment_errorView_isHiddenInitially() {
        launchShopList()
        onView(withId(R.id.tvError))
            .check(matches(not(isDisplayed())))
    }

    // -------------------------------------------------------------------------
    // Search field interaction
    // -------------------------------------------------------------------------

    @Test
    fun searchField_acceptsTextInput() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("Clean"), closeSoftKeyboard())

        // The search field should now display the typed text
        onView(withId(R.id.etSearch))
            .check(matches(withText("Clean")))
    }

    @Test
    fun searchField_canBeCleared() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("Wash"), closeSoftKeyboard())
        onView(withId(R.id.etSearch))
            .perform(replaceText(""), closeSoftKeyboard())

        onView(withId(R.id.etSearch))
            .check(matches(withText("")))
    }

    @Test
    fun searchField_remainsVisibleAfterTyping() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("Laundry"), closeSoftKeyboard())

        onView(withId(R.id.etSearch))
            .check(matches(isDisplayed()))
    }

    @Test
    fun searchField_acceptsSpecialCharacters() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("St. John's"), closeSoftKeyboard())

        onView(withId(R.id.etSearch))
            .check(matches(withText("St. John's")))
    }

    @Test
    fun searchField_acceptsNumericInput() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("123"), closeSoftKeyboard())

        onView(withId(R.id.etSearch))
            .check(matches(withText("123")))
    }

    // -------------------------------------------------------------------------
    // RecyclerView remains visible during / after search
    // -------------------------------------------------------------------------

    @Test
    fun recyclerView_remainsVisibleAfterSearchQuery() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("Cebu"), closeSoftKeyboard())

        onView(withId(R.id.rvShops))
            .check(matches(isDisplayed()))
    }

    @Test
    fun recyclerView_remainsVisibleAfterClearingSearch() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("Test"), closeSoftKeyboard())
        onView(withId(R.id.etSearch))
            .perform(replaceText(""), closeSoftKeyboard())

        onView(withId(R.id.rvShops))
            .check(matches(isDisplayed()))
    }

    // -------------------------------------------------------------------------
    // Error view should not appear from mere UI interaction
    // -------------------------------------------------------------------------

    @Test
    fun errorView_doesNotAppearAfterSearchInput() {
        launchShopList()
        onView(withId(R.id.etSearch))
            .perform(click(), typeText("anything"), closeSoftKeyboard())

        // Error view must remain hidden — errors come only from failed network calls
        onView(withId(R.id.tvError))
            .check(matches(not(isDisplayed())))
    }

    // -------------------------------------------------------------------------
    // Progress bar initial state
    // -------------------------------------------------------------------------

    @Test
    fun progressBar_isGoneOrVisibleOnlyDuringLoad() {
        // We cannot deterministically capture the loading=true moment, but we can
        // assert the fragment inflated without crashing and progressBar exists.
        launchShopList()
        onView(withId(R.id.progressBar))
            .check(matches(not(isDisplayed())))
    }

    // -------------------------------------------------------------------------
    // Layout integrity — no crash on repeated searches
    // -------------------------------------------------------------------------

    @Test
    fun repeatedSearchQueries_doNotCrash() {
        launchShopList()
        val queries = listOf("a", "ab", "abc", "ab", "a", "")
        for (q in queries) {
            onView(withId(R.id.etSearch))
                .perform(replaceText(q), closeSoftKeyboard())
        }
        // If we get here without an exception the fragment handled all queries
        onView(withId(R.id.rvShops))
            .check(matches(isDisplayed()))
    }

    @Test
    fun searchField_handlesVeryLongQuery() {
        launchShopList()
        val longQuery = "a".repeat(500)
        onView(withId(R.id.etSearch))
            .perform(replaceText(longQuery), closeSoftKeyboard())

        onView(withId(R.id.rvShops))
            .check(matches(isDisplayed()))
    }
}
