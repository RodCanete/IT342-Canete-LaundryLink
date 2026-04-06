package edu.cit.canete.laundrylink;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class LaundrylinkApplication {

	public static void main(String[] args) {
		Dotenv dotenv = loadDotenv();

		setIfPresent(dotenv, "DATABASE_URL");
		setIfPresent(dotenv, "DATABASE_USERNAME");
		setIfPresent(dotenv, "DATABASE_PASSWORD");
		setIfPresent(dotenv, "JWT_SECRET");
		setIfPresent(dotenv, "PAYMONGO_SECRET_KEY");
		setIfPresent(dotenv, "PAYMONGO_WEBHOOK_SECRET");
		setIfPresent(dotenv, "PAYMONGO_BASE_URL");
		setIfPresent(dotenv, "PAYMONGO_SUCCESS_URL");
		setIfPresent(dotenv, "PAYMONGO_CANCEL_URL");
		
		SpringApplication.run(LaundrylinkApplication.class, args);
	}

	private static Dotenv loadDotenv() {
		String userDir = System.getProperty("user.dir", ".");
		List<String> candidateDirs = List.of(
			userDir,
			Path.of(userDir, "backend", "laundrylink").toString(),
			Path.of(userDir, "laundrylink").toString()
		);

		for (String dir : candidateDirs) {
			Dotenv dotenv = Dotenv.configure()
				.directory(dir)
				.ignoreIfMissing()
				.load();
			if (dotenv.get("PAYMONGO_SECRET_KEY") != null && !dotenv.get("PAYMONGO_SECRET_KEY").isBlank()) {
				return dotenv;
			}
		}

		return Dotenv.configure()
			.ignoreIfMissing()
			.load();
	}

	private static void setIfPresent(Dotenv dotenv, String key) {
		String value = dotenv.get(key);
		if (value != null && !value.isBlank()) {
			System.setProperty(key, value);
		}
	}

}
