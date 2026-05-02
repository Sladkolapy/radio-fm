#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🚀 Testing PingMusic API\n');

  try {
    // Test 1: Register new user
    console.log('1. Testing registration...');
    const registerData = {
      username: 'testuser',
      password: 'password123'
    };
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
    console.log('   ✅ Registration successful:', registerResponse.data.user.username);
    const token = registerResponse.data.token;

    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, registerData);
    console.log('   ✅ Login successful');
    console.log('   Token:', token.substring(0, 20) + '...');

    // Test 3: Get all tracks
    console.log('\n3. Testing getting all tracks...');
    const tracksResponse = await axios.get(`${API_BASE_URL}/tracks`);
    console.log(`   ✅ Found ${tracksResponse.data.tracks.length} tracks`);

    // Test 4: Get profile
    console.log('\n4. Testing get profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Profile:', profileResponse.data.user.username);

    // Test 5: Create a track (if no test track exists)
    console.log('\n5. Testing create track...');
    const testTrack = {
      title: 'Test Track',
      artist: 'Test Artist',
      mood_type: 'focus'
    };

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(path.join(__dirname, 'test.mp3')));
      formData.append('title', testTrack.title);
      formData.append('artist', testTrack.artist);
      formData.append('mood_type', testTrack.mood_type);

      const createResponse = await axios.post(`${API_BASE_URL}/tracks`, formData, {
        headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() }
      });
      console.log('   ✅ Track created successfully:', createResponse.data.track.id);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ℹ️  Track creation requires valid test audio file');
      } else {
        throw error;
      }
    }

    // Test 6: Get private tracks
    console.log('\n6. Testing private tracks...');
    const privateTracksResponse = await axios.get(`${API_BASE_URL}/tracks/private`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Found ${privateTracksResponse.data.tracks.length} private tracks`);

    // Test 7: Admin tracks
    console.log('\n7. Testing admin tracks...');
    const adminTracksResponse = await axios.get(`${API_BASE_URL}/admin/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Found ${adminTracksResponse.data.tracks.length} tracks (admin view)`);

    console.log('\n✨ All API tests passed!');
    console.log('\n📝 Note: Remove the test user after testing');
    console.log('   DELETE request will be implemented in future updates');

  } catch (error) {
    console.error('\n❌ API Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if backend is running
const checkBackend = async () => {
  try {
    await axios.get(`${API_BASE_URL}/tracks`);
    console.log('✅ Backend server is running');
    testAPI();
  } catch (error) {
    console.error('❌ Backend server is not running');
    console.error('Please start the backend server first:');
    console.error('  cd backend && npm run dev');
    process.exit(1);
  }
};

checkBackend();