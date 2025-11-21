Feature: Appointment Booking
  As a patient
  I want to book an appointment with a doctor
  So that I can receive medical consultation

  Scenario: Successfully booking an appointment
    Given I am a registered patient
    And I am logged in
    And there is a doctor named "Dr. Smith"
    When I request an appointment with "Dr. Smith" for "2023-12-01"
    Then the appointment should be created successfully
    And the status should be "pending"

  Scenario: Booking with invalid date
    Given I am a registered patient
    And I am logged in
    When I request an appointment with "Dr. Smith" for "past-date"
    Then the appointment should not be created
    And I should see an error message "Invalid date"
