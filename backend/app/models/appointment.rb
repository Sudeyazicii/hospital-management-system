class Appointment < ApplicationRecord
  belongs_to :doctor
  belongs_to :patient
  
  validates :date, presence: true
  validates :status, inclusion: { in: %w[pending confirmed cancelled completed] }
end
