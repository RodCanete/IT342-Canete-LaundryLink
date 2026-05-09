package edu.cit.canete.laundrylink;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Full Spring context smoke test.
 *
 * Disabled in CI/unit test runs because it requires a live PostgreSQL database.
 * Run manually with a local DB: ./mvnw test -Dtest=LaundrylinkApplicationTests
 */
@SpringBootTest
@Disabled("Requires live PostgreSQL — run manually with a local database")
class LaundrylinkApplicationTests {

	@Test
	void contextLoads() {
	}

}
