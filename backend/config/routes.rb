Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'login', to: 'auth#login'
      post 'register', to: 'auth#register'
      
      resources :doctors
      resources :patients
      resources :appointments
      resources :departments
      resources :medical_records
    end
  end
end
