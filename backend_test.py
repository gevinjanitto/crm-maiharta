#!/usr/bin/env python3
"""
Backend API Testing for CRM Maiharta - User Management & Welcome Flow
Tests new features: user edit, delete, welcome notifications, password reset
"""

import requests
import json
import sys
import os
from typing import Optional, Dict, Any
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://crm-maiharta-6.preview.emergentagent.com/api"

# Get password from backend .env
with open('/app/backend/.env', 'r') as f:
    for line in f:
        if line.startswith('SEED_PASSWORD='):
            ADMIN_PASSWORD = line.split('=', 1)[1].strip().strip('"')
            break

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name: str):
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}TEST: {name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")

def log_success(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def log_error(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def log_info(msg: str):
    print(f"{Colors.YELLOW}ℹ {msg}{Colors.END}")

class APIClient:
    def __init__(self):
        self.token: Optional[str] = None
        self.session = requests.Session()
        self.user_info = None
    
    def login(self, username: str, password: str = None) -> bool:
        """Login with math captcha"""
        if password is None:
            password = ADMIN_PASSWORD
        
        try:
            # Get captcha
            resp = self.session.get(f"{BACKEND_URL}/auth/captcha", timeout=10)
            if resp.status_code != 200:
                log_error(f"Failed to get captcha: {resp.status_code}")
                return False
            
            captcha = resp.json()
            
            if captcha.get('provider') != 'math':
                log_error(f"Expected math captcha, got {captcha.get('provider')}")
                return False
            
            # Solve math captcha
            question = captcha['question']  # "a + b = ?"
            parts = question.replace('=', '').replace('?', '').strip().split('+')
            answer = str(int(parts[0].strip()) + int(parts[1].strip()))
            
            # Login
            login_data = {
                "username": username,
                "password": password,
                "captcha_id": captcha['id'],
                "captcha_answer": answer,
                "remember": False
            }
            
            resp = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
            if resp.status_code != 200:
                log_error(f"Login failed for {username}: {resp.status_code} - {resp.text}")
                return False
            
            data = resp.json()
            self.token = data['token']
            self.user_info = data['user']
            log_success(f"Logged in as {username} ({data['user']['role']})")
            return True
            
        except Exception as e:
            log_error(f"Login exception: {e}")
            return False
    
    def get(self, path: str, **kwargs) -> requests.Response:
        """GET request with auth"""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        return self.session.get(f"{BACKEND_URL}{path}", headers=headers, timeout=10, **kwargs)
    
    def post(self, path: str, **kwargs) -> requests.Response:
        """POST request with auth"""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        if 'headers' in kwargs:
            headers.update(kwargs.pop('headers'))
        return self.session.post(f"{BACKEND_URL}{path}", headers=headers, timeout=10, **kwargs)
    
    def patch(self, path: str, **kwargs) -> requests.Response:
        """PATCH request with auth"""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        return self.session.patch(f"{BACKEND_URL}{path}", headers=headers, timeout=10, **kwargs)
    
    def delete(self, path: str, **kwargs) -> requests.Response:
        """DELETE request with auth"""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        return self.session.delete(f"{BACKEND_URL}{path}", headers=headers, timeout=10, **kwargs)


# Track created test users for cleanup
created_users = []
created_clients = []


def test_user_creation_with_whatsapp():
    """
    Test 1: POST /api/users with WhatsApp number normalization
    - Create Developer with whatsapp_number '081200000001'
    - Response should have must_change_password=true, welcome_pending=true
    - WhatsApp number should be normalized to '+6281200000001'
    - Invalid WA number should return 400
    - Duplicate username should return 409
    """
    log_test("User Creation with WhatsApp Number")
    
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    # Test 1a: Create user with valid WhatsApp number
    log_info("Test 1a: Creating Developer with WhatsApp number '081200000001'...")
    
    user_data = {
        "name": "Test Developer WA",
        "username": "testdev_wa_001",
        "email": "testdev_wa_001@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": "081200000001"
    }
    
    resp = admin.post("/users", json=user_data)
    if resp.status_code != 200:
        log_error(f"Failed to create user: {resp.status_code} - {resp.text}")
        return False
    
    user = resp.json()
    created_users.append(user['id'])
    
    # Verify response fields
    if not user.get('must_change_password'):
        log_error(f"must_change_password should be true, got {user.get('must_change_password')}")
        return False
    
    if not user.get('welcome_pending'):
        log_error(f"welcome_pending should be true, got {user.get('welcome_pending')}")
        return False
    
    if user.get('whatsapp_number') != '+6281200000001':
        log_error(f"WhatsApp number should be normalized to '+6281200000001', got {user.get('whatsapp_number')}")
        return False
    
    log_success(f"User created: {user['name']} (ID: {user['id']})")
    log_success(f"  must_change_password: {user['must_change_password']}")
    log_success(f"  welcome_pending: {user['welcome_pending']}")
    log_success(f"  whatsapp_number: {user['whatsapp_number']}")
    
    # Test 1b: Invalid WhatsApp number should return 400
    log_info("Test 1b: Testing invalid WhatsApp number...")
    
    invalid_user_data = {
        "name": "Test Invalid WA",
        "username": "testdev_invalid_wa",
        "email": "testdev_invalid@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": "123"  # Invalid
    }
    
    resp = admin.post("/users", json=invalid_user_data)
    if resp.status_code != 400:
        log_error(f"Expected 400 for invalid WhatsApp, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    if 'WhatsApp' not in error_msg or 'internasional' not in error_msg:
        log_error(f"Expected WhatsApp validation error, got: {error_msg}")
        return False
    
    log_success(f"Invalid WhatsApp correctly rejected: {error_msg}")
    
    # Test 1c: Duplicate username should return 409
    log_info("Test 1c: Testing duplicate username...")
    
    duplicate_user_data = {
        "name": "Test Duplicate",
        "username": "testdev_wa_001",  # Same as first user
        "email": "testdev_duplicate@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": ""
    }
    
    resp = admin.post("/users", json=duplicate_user_data)
    if resp.status_code != 409:
        log_error(f"Expected 409 for duplicate username, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    if 'Username' not in error_msg and 'sudah' not in error_msg:
        log_error(f"Expected duplicate username error, got: {error_msg}")
        return False
    
    log_success(f"Duplicate username correctly rejected: {error_msg}")
    
    return True


def test_welcome_flow():
    """
    Test 2: Welcome notification and first login password reset
    - New user logs in
    - /api/auth/me should have must_change_password=true, welcome_pending=true
    - GET /api/notifications should contain 'Selamat datang di CRM Maiharta' with kind='akun'
    - In-app message must NOT contain the password
    - POST /api/auth/password changes password and clears must_change_password
    - Re-login with new password
    - POST /api/auth/welcome-seen clears welcome_pending
    """
    log_test("Welcome Flow: Notifications and Password Reset")
    
    # First create a new user as admin
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    log_info("Creating new user for welcome flow test...")
    
    user_data = {
        "name": "Test Welcome User",
        "username": "testwelcome_001",
        "email": "testwelcome_001@maiharta.example",
        "password": "InitialPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": "081234567890"
    }
    
    resp = admin.post("/users", json=user_data)
    if resp.status_code != 200:
        log_error(f"Failed to create user: {resp.status_code} - {resp.text}")
        return False
    
    user = resp.json()
    created_users.append(user['id'])
    log_success(f"User created: {user['name']} (ID: {user['id']})")
    
    # Test 2a: New user logs in
    log_info("Test 2a: New user logging in...")
    
    new_user = APIClient()
    if not new_user.login("testwelcome_001", "InitialPassword123"):
        log_error("Failed to login as new user")
        return False
    
    # Test 2b: Check /api/auth/me
    log_info("Test 2b: Checking /api/auth/me...")
    
    resp = new_user.get("/auth/me")
    if resp.status_code != 200:
        log_error(f"Failed to get /auth/me: {resp.status_code}")
        return False
    
    me = resp.json()
    
    if not me.get('must_change_password'):
        log_error(f"must_change_password should be true, got {me.get('must_change_password')}")
        return False
    
    if not me.get('welcome_pending'):
        log_error(f"welcome_pending should be true, got {me.get('welcome_pending')}")
        return False
    
    log_success(f"/auth/me: must_change_password={me['must_change_password']}, welcome_pending={me['welcome_pending']}")
    
    # Test 2c: Check notifications
    log_info("Test 2c: Checking welcome notification...")
    
    resp = new_user.get("/notifications")
    if resp.status_code != 200:
        log_error(f"Failed to get notifications: {resp.status_code}")
        return False
    
    notifs = resp.json()
    items = notifs.get('items', [])
    
    welcome_notif = None
    for item in items:
        if 'Selamat datang di CRM Maiharta' in item.get('title', ''):
            welcome_notif = item
            break
    
    if not welcome_notif:
        log_error("Welcome notification not found")
        log_info(f"Available notifications: {[n.get('title') for n in items]}")
        return False
    
    if welcome_notif.get('kind') != 'akun':
        log_error(f"Welcome notification kind should be 'akun', got {welcome_notif.get('kind')}")
        return False
    
    # Check that in-app message does NOT contain the password
    message = welcome_notif.get('message', '')
    if 'InitialPassword123' in message or 'Password awal:' in message:
        log_error(f"In-app message should NOT contain password, but got: {message}")
        return False
    
    log_success(f"Welcome notification found: {welcome_notif['title']}")
    log_success(f"  kind: {welcome_notif['kind']}")
    log_success(f"  In-app message does NOT contain password ✓")
    
    # Test 2d: Change password
    log_info("Test 2d: Changing password...")
    
    password_data = {
        "current_password": "InitialPassword123",
        "new_password": "NewSecurePassword123"
    }
    
    resp = new_user.post("/auth/password", json=password_data)
    if resp.status_code != 200:
        log_error(f"Failed to change password: {resp.status_code} - {resp.text}")
        return False
    
    log_success("Password changed successfully")
    
    # Test 2e: Re-login with new password
    log_info("Test 2e: Re-logging in with new password...")
    
    new_user2 = APIClient()
    if not new_user2.login("testwelcome_001", "NewSecurePassword123"):
        log_error("Failed to login with new password")
        return False
    
    # Check that must_change_password is now false
    resp = new_user2.get("/auth/me")
    if resp.status_code != 200:
        log_error(f"Failed to get /auth/me: {resp.status_code}")
        return False
    
    me = resp.json()
    
    if me.get('must_change_password'):
        log_error(f"must_change_password should be false after password change, got {me.get('must_change_password')}")
        return False
    
    log_success(f"must_change_password cleared after password change: {me['must_change_password']}")
    
    # Test 2f: Mark welcome as seen
    log_info("Test 2f: Marking welcome as seen...")
    
    resp = new_user2.post("/auth/welcome-seen")
    if resp.status_code != 200:
        log_error(f"Failed to mark welcome as seen: {resp.status_code} - {resp.text}")
        return False
    
    # Check that welcome_pending is now false
    resp = new_user2.get("/auth/me")
    if resp.status_code != 200:
        log_error(f"Failed to get /auth/me: {resp.status_code}")
        return False
    
    me = resp.json()
    
    if me.get('welcome_pending'):
        log_error(f"welcome_pending should be false after welcome-seen, got {me.get('welcome_pending')}")
        return False
    
    log_success(f"welcome_pending cleared after welcome-seen: {me['welcome_pending']}")
    
    return True


def test_user_edit():
    """
    Test 3: PATCH /api/users/{id} - Edit user details
    - Edit name, username (lowercased), email, whatsapp_number
    - Username duplicate of 'admin' should return 409
    - Email used by another user should return 409
    - After username change, login with new username works, old fails
    """
    log_test("User Edit with Duplicate Checks")
    
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    # Create a test user
    log_info("Creating test user for edit...")
    
    user_data = {
        "name": "Test Edit User",
        "username": "testedit_001",
        "email": "testedit_001@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": "081234567891"
    }
    
    resp = admin.post("/users", json=user_data)
    if resp.status_code != 200:
        log_error(f"Failed to create user: {resp.status_code} - {resp.text}")
        return False
    
    user = resp.json()
    user_id = user['id']
    created_users.append(user_id)
    log_success(f"User created: {user['name']} (ID: {user_id})")
    
    # Test 3a: Edit name, username, email, whatsapp_number
    log_info("Test 3a: Editing user details...")
    
    edit_data = {
        "name": "Test Edit User UPDATED",
        "username": "TestEdit_Updated",  # Mixed case - should be lowercased
        "email": "testedit_updated@maiharta.example",
        "whatsapp_number": "081234567892"
    }
    
    resp = admin.patch(f"/users/{user_id}", json=edit_data)
    if resp.status_code != 200:
        log_error(f"Failed to edit user: {resp.status_code} - {resp.text}")
        return False
    
    updated_user = resp.json()
    
    if updated_user['name'] != "Test Edit User UPDATED":
        log_error(f"Name not updated: {updated_user['name']}")
        return False
    
    if updated_user['username'] != "testedit_updated":  # Should be lowercased
        log_error(f"Username not lowercased: {updated_user['username']}")
        return False
    
    if updated_user['email'] != "testedit_updated@maiharta.example":
        log_error(f"Email not updated: {updated_user['email']}")
        return False
    
    if updated_user['whatsapp_number'] != "+6281234567892":
        log_error(f"WhatsApp not updated/normalized: {updated_user['whatsapp_number']}")
        return False
    
    log_success(f"User updated successfully:")
    log_success(f"  name: {updated_user['name']}")
    log_success(f"  username: {updated_user['username']} (lowercased)")
    log_success(f"  email: {updated_user['email']}")
    log_success(f"  whatsapp_number: {updated_user['whatsapp_number']}")
    
    # Test 3b: Try to change username to 'admin' (duplicate)
    log_info("Test 3b: Testing duplicate username 'admin'...")
    
    resp = admin.patch(f"/users/{user_id}", json={"username": "admin"})
    if resp.status_code != 409:
        log_error(f"Expected 409 for duplicate username, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    if 'Username' not in error_msg and 'sudah' not in error_msg:
        log_error(f"Expected duplicate username error, got: {error_msg}")
        return False
    
    log_success(f"Duplicate username correctly rejected: {error_msg}")
    
    # Test 3c: Create another user and try to use their email
    log_info("Test 3c: Testing duplicate email...")
    
    user2_data = {
        "name": "Test User 2",
        "username": "testuser_002",
        "email": "testuser_002@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": ""
    }
    
    resp = admin.post("/users", json=user2_data)
    if resp.status_code != 200:
        log_error(f"Failed to create second user: {resp.status_code}")
        return False
    
    user2 = resp.json()
    created_users.append(user2['id'])
    
    # Try to change first user's email to second user's email
    resp = admin.patch(f"/users/{user_id}", json={"email": "testuser_002@maiharta.example"})
    if resp.status_code != 409:
        log_error(f"Expected 409 for duplicate email, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    if 'Email' not in error_msg and 'sudah' not in error_msg:
        log_error(f"Expected duplicate email error, got: {error_msg}")
        return False
    
    log_success(f"Duplicate email correctly rejected: {error_msg}")
    
    # Test 3d: Login with new username works, old username fails
    log_info("Test 3d: Testing login with new username...")
    
    # Try old username (should fail)
    old_user = APIClient()
    if old_user.login("testedit_001", "TestPassword123"):
        log_error("Old username should not work after change")
        return False
    
    log_success("Old username correctly rejected")
    
    # Try new username (should work)
    new_user = APIClient()
    if not new_user.login("testedit_updated", "TestPassword123"):
        log_error("New username should work after change")
        return False
    
    log_success("New username works correctly")
    
    return True


def test_user_delete():
    """
    Test 4: DELETE /api/users/{id}
    - Admin deletes test user -> 200, user gone from GET /api/users, login fails
    - Self-delete -> 400
    - Non-admin (e.g. adminproject) calling DELETE -> 403
    - Deleting unknown id -> 404
    """
    log_test("User Permanent Delete")
    
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    # Create a test user to delete
    log_info("Creating test user for deletion...")
    
    user_data = {
        "name": "Test Delete User",
        "username": "testdelete_001",
        "email": "testdelete_001@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": ""
    }
    
    resp = admin.post("/users", json=user_data)
    if resp.status_code != 200:
        log_error(f"Failed to create user: {resp.status_code} - {resp.text}")
        return False
    
    user = resp.json()
    user_id = user['id']
    log_success(f"User created: {user['name']} (ID: {user_id})")
    
    # Test 4a: Admin deletes user
    log_info("Test 4a: Admin deleting user...")
    
    resp = admin.delete(f"/users/{user_id}")
    if resp.status_code != 200:
        log_error(f"Failed to delete user: {resp.status_code} - {resp.text}")
        return False
    
    log_success(f"User deleted: {resp.json().get('message')}")
    
    # Verify user is gone from GET /api/users
    resp = admin.get("/users")
    if resp.status_code != 200:
        log_error(f"Failed to get users: {resp.status_code}")
        return False
    
    users = resp.json()
    if any(u['id'] == user_id for u in users):
        log_error("Deleted user still appears in user list")
        return False
    
    log_success("User correctly removed from user list")
    
    # Verify login fails
    deleted_user = APIClient()
    if deleted_user.login("testdelete_001", "TestPassword123"):
        log_error("Deleted user should not be able to login")
        return False
    
    log_success("Deleted user cannot login")
    
    # Test 4b: Self-delete should fail
    log_info("Test 4b: Testing self-delete (should fail)...")
    
    resp = admin.get("/auth/me")
    admin_id = resp.json()['id']
    
    resp = admin.delete(f"/users/{admin_id}")
    if resp.status_code != 400:
        log_error(f"Expected 400 for self-delete, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    log_success(f"Self-delete correctly rejected: {error_msg}")
    
    # Test 4c: Non-admin cannot delete
    log_info("Test 4c: Testing non-admin delete (should fail)...")
    
    # Create a non-admin user (Admin Project)
    adminproject_data = {
        "name": "Test Admin Project",
        "username": "testadminproject_001",
        "email": "testadminproject@maiharta.example",
        "password": "TestPassword123",
        "role": "Admin Project",
        "client_id": "",
        "whatsapp_number": ""
    }
    
    resp = admin.post("/users", json=adminproject_data)
    if resp.status_code != 200:
        log_error(f"Failed to create Admin Project user: {resp.status_code}")
        return False
    
    adminproject_user = resp.json()
    created_users.append(adminproject_user['id'])
    
    # Login as Admin Project
    adminproject = APIClient()
    if not adminproject.login("testadminproject_001", "TestPassword123"):
        log_error("Failed to login as Admin Project")
        return False
    
    # Create another user to try to delete
    test_user_data = {
        "name": "Test User to Delete",
        "username": "testuser_todelete",
        "email": "testuser_todelete@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": ""
    }
    
    resp = admin.post("/users", json=test_user_data)
    if resp.status_code != 200:
        log_error(f"Failed to create test user: {resp.status_code}")
        return False
    
    test_user = resp.json()
    test_user_id = test_user['id']
    created_users.append(test_user_id)
    
    # Try to delete as Admin Project
    resp = adminproject.delete(f"/users/{test_user_id}")
    if resp.status_code != 403:
        log_error(f"Expected 403 for non-admin delete, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    log_success(f"Non-admin delete correctly rejected: {error_msg}")
    
    # Test 4d: Deleting unknown ID
    log_info("Test 4d: Testing delete of unknown ID...")
    
    resp = admin.delete("/users/unknown-user-id-12345")
    if resp.status_code != 404:
        log_error(f"Expected 404 for unknown user, got {resp.status_code}")
        return False
    
    error_msg = resp.json().get('detail', '')
    log_success(f"Unknown user delete correctly rejected: {error_msg}")
    
    return True


def test_user_deactivate():
    """
    Test 5: Deactivate via PATCH active=false (existing feature)
    """
    log_test("User Deactivation (Existing Feature)")
    
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    # Create a test user
    log_info("Creating test user for deactivation...")
    
    user_data = {
        "name": "Test Deactivate User",
        "username": "testdeactivate_001",
        "email": "testdeactivate@maiharta.example",
        "password": "TestPassword123",
        "role": "Developer",
        "client_id": "",
        "whatsapp_number": ""
    }
    
    resp = admin.post("/users", json=user_data)
    if resp.status_code != 200:
        log_error(f"Failed to create user: {resp.status_code}")
        return False
    
    user = resp.json()
    user_id = user['id']
    created_users.append(user_id)
    log_success(f"User created: {user['name']} (ID: {user_id})")
    
    # Deactivate user
    log_info("Deactivating user...")
    
    resp = admin.patch(f"/users/{user_id}", json={"active": False})
    if resp.status_code != 200:
        log_error(f"Failed to deactivate user: {resp.status_code} - {resp.text}")
        return False
    
    updated_user = resp.json()
    
    if updated_user.get('active') != False:
        log_error(f"User should be inactive, got active={updated_user.get('active')}")
        return False
    
    log_success(f"User deactivated: active={updated_user['active']}")
    
    # Verify user cannot login
    deactivated = APIClient()
    if deactivated.login("testdeactivate_001", "TestPassword123"):
        log_error("Deactivated user should not be able to login")
        return False
    
    log_success("Deactivated user cannot login")
    
    return True


def test_client_creation_with_account():
    """
    Test 6: POST /api/clients creates client with auto account
    - Account should have must_change_password=true, welcome_pending=true
    - Welcome notification should exist
    """
    log_test("Client Creation with Auto Account")
    
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    log_info("Creating client with auto account...")
    
    client_data = {
        "name": "Test Client Company",
        "contact": "Test Contact Person",
        "email": "testclient_001@maiharta.example",
        "phone": "081234567893",
        "industry": "Technology",
        "address": "Test Address"
    }
    
    resp = admin.post("/clients", json=client_data)
    if resp.status_code != 200:
        log_error(f"Failed to create client: {resp.status_code} - {resp.text}")
        return False
    
    client = resp.json()
    client_id = client['id']
    created_clients.append(client_id)
    log_success(f"Client created: {client['name']} (ID: {client_id})")
    
    # Check if account was created
    account = client.get('account', {})
    if not account.get('created'):
        log_info("Account already existed (from previous test run)")
    else:
        log_success(f"Auto account created: username={account.get('username')}")
    
    # Get the user account
    resp = admin.get("/users")
    if resp.status_code != 200:
        log_error(f"Failed to get users: {resp.status_code}")
        return False
    
    users = resp.json()
    client_user = None
    for u in users:
        if u.get('email') == "testclient_001@maiharta.example":
            client_user = u
            break
    
    if not client_user:
        log_error("Client user account not found")
        return False
    
    # Verify must_change_password and welcome_pending
    if not client_user.get('must_change_password'):
        log_error(f"Client account must_change_password should be true, got {client_user.get('must_change_password')}")
        return False
    
    if not client_user.get('welcome_pending'):
        log_error(f"Client account welcome_pending should be true, got {client_user.get('welcome_pending')}")
        return False
    
    log_success(f"Client account has correct flags:")
    log_success(f"  must_change_password: {client_user['must_change_password']}")
    log_success(f"  welcome_pending: {client_user['welcome_pending']}")
    
    # Login as client and check for welcome notification
    client_login = APIClient()
    # Use default client password from core.py (DEFAULT_CLIENT_PASSWORD = '12345678')
    if not client_login.login(client_user['username'], "12345678"):
        log_error("Failed to login as client")
        return False
    
    resp = client_login.get("/notifications")
    if resp.status_code != 200:
        log_error(f"Failed to get notifications: {resp.status_code}")
        return False
    
    notifs = resp.json()
    items = notifs.get('items', [])
    
    welcome_notif = None
    for item in items:
        if 'Selamat datang' in item.get('title', ''):
            welcome_notif = item
            break
    
    if not welcome_notif:
        log_error("Welcome notification not found for client")
        return False
    
    log_success(f"Welcome notification exists: {welcome_notif['title']}")
    
    return True


def test_projects_regression():
    """
    Test 7: Regression - GET /api/projects works and items have start_date
    """
    log_test("Regression: GET /api/projects")
    
    admin = APIClient()
    if not admin.login("admin"):
        return False
    
    log_info("Testing GET /api/projects...")
    
    resp = admin.get("/projects")
    if resp.status_code != 200:
        log_error(f"Failed to get projects: {resp.status_code}")
        return False
    
    projects = resp.json()
    log_success(f"GET /api/projects works: {len(projects)} projects")
    
    if len(projects) > 0:
        # Check if projects have start_date
        sample_project = projects[0]
        if 'start_date' not in sample_project:
            log_error(f"Project missing start_date field: {sample_project.get('name')}")
            return False
        
        log_success(f"Projects have start_date field: {sample_project.get('start_date')}")
    
    return True


def cleanup():
    """Clean up all test users and clients created during testing"""
    log_test("Cleanup: Removing Test Data")
    
    admin = APIClient()
    if not admin.login("admin"):
        log_error("Failed to login for cleanup")
        return
    
    # Delete test users
    for user_id in created_users:
        try:
            resp = admin.delete(f"/users/{user_id}")
            if resp.status_code == 200:
                log_success(f"Deleted test user: {user_id}")
            elif resp.status_code == 404:
                log_info(f"User already deleted: {user_id}")
            else:
                log_error(f"Failed to delete user {user_id}: {resp.status_code}")
        except Exception as e:
            log_error(f"Exception deleting user {user_id}: {e}")
    
    # Delete test clients
    for client_id in created_clients:
        try:
            # First delete associated user account
            resp = admin.get("/users")
            if resp.status_code == 200:
                users = resp.json()
                for u in users:
                    if u.get('client_id') == client_id:
                        admin.delete(f"/users/{u['id']}")
            
            # Then delete client
            resp = admin.delete(f"/clients/{client_id}")
            if resp.status_code == 200:
                log_success(f"Deleted test client: {client_id}")
            elif resp.status_code == 404:
                log_info(f"Client already deleted: {client_id}")
            else:
                log_error(f"Failed to delete client {client_id}: {resp.status_code}")
        except Exception as e:
            log_error(f"Exception deleting client {client_id}: {e}")


def main():
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}CRM Maiharta Backend Testing - User Management & Welcome Flow{Colors.END}")
    print(f"{Colors.BLUE}Backend URL: {BACKEND_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    results = {}
    
    # Run all tests
    try:
        results['User Creation with WhatsApp'] = test_user_creation_with_whatsapp()
    except Exception as e:
        log_error(f"User creation test exception: {e}")
        import traceback
        traceback.print_exc()
        results['User Creation with WhatsApp'] = False
    
    try:
        results['Welcome Flow'] = test_welcome_flow()
    except Exception as e:
        log_error(f"Welcome flow test exception: {e}")
        import traceback
        traceback.print_exc()
        results['Welcome Flow'] = False
    
    try:
        results['User Edit'] = test_user_edit()
    except Exception as e:
        log_error(f"User edit test exception: {e}")
        import traceback
        traceback.print_exc()
        results['User Edit'] = False
    
    try:
        results['User Delete'] = test_user_delete()
    except Exception as e:
        log_error(f"User delete test exception: {e}")
        import traceback
        traceback.print_exc()
        results['User Delete'] = False
    
    try:
        results['User Deactivate'] = test_user_deactivate()
    except Exception as e:
        log_error(f"User deactivate test exception: {e}")
        import traceback
        traceback.print_exc()
        results['User Deactivate'] = False
    
    try:
        results['Client Creation with Account'] = test_client_creation_with_account()
    except Exception as e:
        log_error(f"Client creation test exception: {e}")
        import traceback
        traceback.print_exc()
        results['Client Creation with Account'] = False
    
    try:
        results['Projects Regression'] = test_projects_regression()
    except Exception as e:
        log_error(f"Projects regression test exception: {e}")
        import traceback
        traceback.print_exc()
        results['Projects Regression'] = False
    
    # Cleanup
    try:
        cleanup()
    except Exception as e:
        log_error(f"Cleanup exception: {e}")
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    for test_name, passed in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if passed else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    if all_passed:
        print(f"{Colors.GREEN}ALL TESTS PASSED ✓{Colors.END}")
        return 0
    else:
        print(f"{Colors.RED}SOME TESTS FAILED ✗{Colors.END}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
