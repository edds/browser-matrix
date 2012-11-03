require 'rubygems'
require 'bundler'
require 'sinatra'
require 'omniauth'
require 'omniauth-google-oauth2'

enable :sessions
#use Rack::Session::Cookie, :secret => ENV['RACK_COOKIE_SECRET']

use OmniAuth::Strategies::GoogleOauth2, ENV['GOOGLE_KEY'], ENV['GOOGLE_SECRET'], {:scope => 'analytics.readonly,userinfo.email', :access_type => 'online', :approval_prompt => ''}

OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

get '/' do
  erb :"index.html"
end

get '/user' do
  @token = session['token']
  erb :"user.html"
end


get '/auth/:provider/callback' do
  session['token'] = request.env['omniauth.auth']['credentials']['token']
  content_type 'text/plain'
  request.env['omniauth.auth'].to_hash.inspect rescue "No Data"
end

get '/auth/failure' do
  content_type 'text/plain'
  request.env['omniauth.auth'].to_hash.inspect rescue "No Data"
end

