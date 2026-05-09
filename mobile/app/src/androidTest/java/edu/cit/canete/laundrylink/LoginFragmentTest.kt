package edu.cit.canete.laundrylink

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isEnabled
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import org.hamcrest.Matchers.not
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumented UI tests for [edu.cit.canete.laundrylink.features.auth.ui.LoginFragment].
 *
 * These tests launch [MainActivity] which starts on the loginFragment destination
 * as defined in nav_graph.xml (app:startDestination="@id/loginFragment").
 *
 * Tests validate client-side input validation (no network calls are made).
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class LoginFragmentTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    // -------------------------------------------------------------------------
    // View visibility / initial state
    // -------------------------------------------------------------------------

    @Test
    fun loginFragment_isDisplayedOnLaunch() {
        onView(withId(R.id.btnLogin))
            .check(matches(isDisplayed()))
    }

    @Test
    fun emailField_isDisplayedOnLaunch() {
        onView(withId(R.id.etEmail))
            .check(matches(isDisplayed()))
    }

    @Test
    fun passwordField_isDisplayedOnLaunch() {
        onView(withId(R.id.etPassword))
            .check(matches(isDisplayed()))
    }

    @Test
    fun goToRegisterButton_isDisplayedOnLaunch() {
        onView(withId(R.id.btnGoToRegister))
            .check(matches(isDisplayed()))
    }

    @Test
    fun errorTextView_isInitiallyHidden() {
        onView(withId(R.id.tvError))
            .check(matches(not(isDisplayed())))
    }

    @Test
    fun progressBar_isInitiallyHidden() {
        onView(withId(R.id.progressBar))
            .check(matches(not(isDisplayed())))
    }

    // -------------------------------------------------------------------------
    // Input validation — blank / invalid email
    // -------------------------------------------------------------------------

    @Test
    fun clickLogin_withBlankEmail_showsEmailError() {
        onView(withId(R.id.etEmail))
            .perform(replaceText(""), closeSoftKeyboard())
        onView(withId(R.id.etPassword))
            .perform(replaceText("password123"), closeSoftKeyboard())

        onView(withId(R.id.btnLogin)).perform(click())

        onView(withId(R.id.tvError))
            .check(matches(isDisplayed()))
        onView(withId(R.id.tvError))
            .check(matches(withText("Enter a valid email address")))
    }

    @Test
    fun clickLogin_withInvalidEmailFormat_showsEmailError() {
        onView(withId(R.id.etEmail))
            .perform(replaceText("not-an-email"), closeSoftKeyboard())
        onView(withId(R.id.etPassword))
            .perform(replaceText("password123"), closeSoftKeyboard())

        onView(withId(R.id.btnLogin)).perform(click())

        onView(withId(R.id.tvError))
            .check(matches(isDisplayed()))
        onView(withId(R.id.tvError))
            .check(matches(withText("Enter a valid email address")))
    }

    @Test
    fun clickLogin_withEmailMissingAt_showsEmailError() {
        onView(withId(R.id.etEmail))
            .perform(replaceText("userexample.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword))
            .perform(replaceText("password123"), closeSoftKeyboard())

        onView(withId(R.id.btnLogin)).perform(click())

        onView(withId(R.id.tvError))
            .check(matches(withText("Enter a valid email address")))
    }

    // -------------------------------------------------------------------------
    // Input validation — blank password
    // -------------------------------------------------------------------------

    @Test
    fun clickLogin_withValidEmailAndBlankPassword_showsPasswordError() {
        onView(withId(R.id.etEmail))
            .perform(replaceText("user@example.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword))
            .perform(replaceText(""), closeSoftKeyboard())

        onView(withId(R.id.btnLogin)).perform(click())

        onView(withId(R.id.tvError))
            .check(matches(isDisplayed()))
        onView(withId(R.id.tvError))
            .check(matches(withText("Password is required")))
    }

    @Test
    fun clickLogin_withWhitespaceOnlyPassword_showsPasswordError() {
        onView(withId(R.id.etEmail))
            .perform(replaceText("user@example.com"), closeSoftKeyboard())
        // Whitespace-only password — the fragment checks isBlank()
        onView(withId(R.id.etPassword))
            .perform(replaceText("   "), closeSoftKeyboard())

        onView(withId(R.id.btnLogin)).perform(click())

        onView(withId(R.id.tvError))
            .check(matches(withText("Password is required")))
    }

    // -------------------------------------------------------------------------
    // Error text view — becomes hidden when user corrects input
    // -------------------------------------------------------------------------

    @Test
    fun errorView_isHiddenBeforeButtonClick() {
        // Error view starts gone; typing alone should not reveal it
        onView(withId(R.id.etEmail))
            .perform(replaceText("user@example.com"), closeSoftKeyboard())

        onView(withId(R.id.tvError))
            .check(matches(not(isDisplayed())))
    }

    // -------------------------------------------------------------------------
    // Login button state
    // -------------------------------------------------------------------------

    @Test
    fun loginButton_isEnabledByDefault() {
        onView(withId(R.id.btnLogin))
            .check(matches(isEnabled()))
    }

    // -------------------------------------------------------------------------
    // Navigation — go to register
    // -------------------------------------------------------------------------

    @Test
    fun clickGoToRegister_navigatesToRegisterFragment() {
        onView(withId(R.id.btnGoToRegister)).perform(click())

        // RegisterFragment has a "Sign Up" button — verify navigation occurred
        onView(withId(R.id.btnRegister))
            .check(matches(isDisplayed()))
    }

    // -------------------------------------------------------------------------
    // Both fields empty
    // -------------------------------------------------------------------------

    @Test
    fun clickLogin_withBothFieldsEmpty_showsEmailError() {
        onView(withId(R.id.etEmail))
            .perform(replaceText(""), closeSoftKeyboard())
        onView(withId(R.id.etPassword))
            .perform(replaceText(""), closeSoftKeyboard())

        onView(withId(R.id.btnLogin)).perform(click())

        // Email check comes first in the when-block
        onView(withId(R.id.tvError))
            .check(matches(withText("Enter a valid email address")))
    }
}
