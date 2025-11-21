class Api::V1::DoctorsController < ApplicationController
  def index
    @doctors = Doctor.all
    render json: @doctors
  end

  def show
    @doctor = Doctor.find(params[:id])
    render json: @doctor
  end

  def create
    @doctor = Doctor.create(doctor_params)
    if @doctor.valid?
      render json: @doctor, status: :created
    else
      render json: { error: 'Failed to create doctor' }, status: :unprocessable_entity
    end
  end

  private

  def doctor_params
    params.permit(:user_id, :department_id, :specialization, :bio)
  end
end
