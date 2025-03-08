import { test, expect } from "@playwright/test";

const VALID_CORPORATION_NUMBERS = [
  "826417395",
  "158739264",
  "123456789",
  "591863427",
  "312574689",
  "287965143",
  "265398741",
  "762354918",
  "468721395",
  "624719583",
];

test("form validation and submission", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Test empty form submission
  await page.getByTestId("submit-button").click();
  await expect(page.getByText("First name is required")).toBeVisible();
  await expect(page.getByText("Last name is required")).toBeVisible();
  // await expect(page.getByText("Phone number is required")).toBeVisible();
  await expect(page.getByText("Corporation number is required")).toBeVisible();

  // Test invalid phone number format
  await page.getByTestId("first-name-input").fill("Devon");
  await page.getByTestId("last-name-input").fill("Miller");
  await page.getByTestId("phone-input").fill("+1234567890");
  await page
    .getByTestId("corporation-number-input")
    .fill(VALID_CORPORATION_NUMBERS[0]);
  await page.getByTestId("submit-button").click();
  await expect(
    page.getByText("Please enter a valid Canadian phone number")
  ).toBeVisible();

  // Test invalid corporation number
  await page.getByTestId("phone-input").fill("+1 647 531 7990");
  await page.getByTestId("corporation-number-input").fill("123123123");
  await page.getByTestId("submit-button").click();
  await expect(page.getByText("Invalid corporation number")).toBeVisible();

  // Test name length validation
  const longName = "a".repeat(55);
  await page.getByTestId("first-name-input").fill(longName);
  await page.waitForTimeout(1000);
  await page
    .getByTestId("corporation-number-input")
    .fill(VALID_CORPORATION_NUMBERS[0]);
  await page.waitForTimeout(1000);
  await page.getByTestId("submit-button").click();
  await page.waitForTimeout(1000);

  await expect(
    page.getByText("Name cannot exceed 50 characters")
  ).toBeVisible();
  await page.getByTestId("first-name-input").fill("Devon");

  await page.getByTestId("last-name-input").fill(longName);
  await expect(
    page.getByText("Name cannot exceed 50 characters")
  ).toBeVisible();
  await page.getByTestId("last-name-input").fill("Miller");

  // Test successful submission
  await page
    .getByTestId("corporation-number-input")
    .fill(VALID_CORPORATION_NUMBERS[0]);
  await page.getByTestId("submit-button").click();
  await expect(page.getByText("Form submitted successfully!")).toBeVisible();

  // Test form reset after successful submission
  await expect(page.getByTestId("first-name-input")).toHaveValue("");
  await expect(page.getByTestId("last-name-input")).toHaveValue("");
  await expect(page.getByTestId("phone-input")).toHaveValue("+1");
  await expect(page.getByTestId("corporation-number-input")).toHaveValue("");

  // Test another successful submission with different valid data
  await page.getByTestId("first-name-input").fill("Jane");
  await page.getByTestId("last-name-input").fill("Doe");
  await page.getByTestId("phone-input").fill("+1 416 555 0123");
  await page
    .getByTestId("corporation-number-input")
    .fill(VALID_CORPORATION_NUMBERS[1]);
  await page.getByTestId("submit-button").click();
  await expect(page.getByText("Form submitted successfully!")).toBeVisible();
});
