Given('I am a registered patient') do
  @patient = FactoryBot.create(:patient)
  @user = @patient.user
end

Given('I am logged in') do
  # Mock login logic
  @token = 'mock_token'
end

Given('there is a doctor named {string}') do |name|
  @doctor = FactoryBot.create(:doctor, user: FactoryBot.create(:user, email: 'doc@test.com'))
end

When('I request an appointment with {string} for {string}') do |doctor_name, date|
  @response = post '/api/v1/appointments', { doctor_id: @doctor.id, date: date }
end

Then('the appointment should be created successfully') do
  expect(@response.status).to eq(201)
end

Then('the status should be {string}') do |status|
  expect(JSON.parse(@response.body)['status']).to eq(status)
end
