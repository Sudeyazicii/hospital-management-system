class Doctor < ApplicationRecord
  belongs_to :user
  belongs_to :department
  has_many :appointments
  has_many :patients, through: :appointments
  
  validates :specialization, presence: true
end
