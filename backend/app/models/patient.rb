class Patient < ApplicationRecord
  belongs_to :user
  has_many :appointments
  has_many :medical_records
  
  validates :date_of_birth, presence: true
end
