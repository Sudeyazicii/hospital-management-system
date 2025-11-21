class User < ApplicationRecord
  has_secure_password
  
  validates :email, presence: true, uniqueness: true
  validates :role, presence: true, inclusion: { in: %w[admin doctor patient] }
  
  has_one :doctor
  has_one :patient
end
