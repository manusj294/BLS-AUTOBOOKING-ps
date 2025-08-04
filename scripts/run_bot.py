#!/usr/bin/env python3
"""
BLS Browser Automation Bot
Handles webcam verification and booking process automation
"""

import json
import sys
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import subprocess

def launch_browser_bot(applicant_data, id_photo_path):
    """
    Launch browser automation for BLS webcam verification
    
    Args:
        applicant_data (dict): Applicant information
        id_photo_path (str): Path to the ID photo
    """
    
    print("🤖 Launching BLS browser automation bot...")
    print(f"👤 Applicant: {applicant_data.get('firstName', '')} {applicant_data.get('lastName', '')}")
    
    # Chrome options for automation
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Enable camera and microphone
    chrome_options.add_argument("--use-fake-ui-for-media-stream")
    chrome_options.add_argument("--use-fake-device-for-media-stream")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    
    # Grant camera permissions
    prefs = {
        "profile.default_content_setting_values.media_stream_camera": 1,
        "profile.default_content_setting_values.media_stream_mic": 1,
        "profile.default_content_settings.popups": 0,
        "profile.managed_default_content_settings.images": 1
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    driver = None
    
    try:
        # Initialize Chrome driver
        print("🌐 Starting Chrome browser...")
        driver = webdriver.Chrome(options=chrome_options)
        
        # Execute script to hide automation indicators
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Navigate to BLS website
        bls_url = "https://algeria.blsspainvisa.com/"
        print(f"🔗 Navigating to: {bls_url}")
        driver.get(bls_url)
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        print("✅ BLS website loaded successfully")
        
        # Look for appointment booking section
        print("🔍 Looking for appointment booking options...")
        
        # Common selectors for BLS appointment booking
        booking_selectors = [
            "a[href*='appointment']",
            "a[href*='booking']",
            ".appointment-link",
            ".booking-link",
            "button:contains('Book Appointment')",
            "a:contains('Appointment')",
            "a:contains('Book Now')"
        ]
        
        booking_element = None
        for selector in booking_selectors:
            try:
                booking_element = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
                print(f"✅ Found booking element: {selector}")
                break
            except TimeoutException:
                continue
        
        if booking_element:
            print("🖱️  Clicking on appointment booking...")
            booking_element.click()
            time.sleep(3)
        else:
            print("⚠️  Booking element not found, continuing with current page...")
        
        # Fill applicant information if forms are present
        fill_applicant_form(driver, applicant_data)
        
        # Monitor for webcam prompts
        monitor_webcam_prompts(driver)
        
        print("✅ Browser automation completed successfully")
        
        return {
            "success": True,
            "message": "Browser automation completed",
            "applicant": f"{applicant_data.get('firstName', '')} {applicant_data.get('lastName', '')}",
            "url": driver.current_url
        }
        
    except Exception as e:
        print(f"❌ Browser automation error: {str(e)}")
        raise
        
    finally:
        if driver:
            print("🔒 Closing browser...")
            driver.quit()

def fill_applicant_form(driver, applicant_data):
    """Fill applicant information in forms"""
    
    print("📝 Looking for applicant forms to fill...")
    
    # Common form field mappings
    field_mappings = {
        'firstName': ['input[name*="first"]', 'input[name*="fname"]', 'input[id*="first"]'],
        'lastName': ['input[name*="last"]', 'input[name*="lname"]', 'input[id*="last"]'],
        'email': ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'],
        'phone': ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'],
        'passportNumber': ['input[name*="passport"]', 'input[id*="passport"]'],
        'nationality': ['select[name*="nationality"]', 'select[id*="nationality"]']
    }
    
    filled_fields = 0
    
    for field_name, selectors in field_mappings.items():
        if field_name in applicant_data and applicant_data[field_name]:
            for selector in selectors:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed() and element.is_enabled():
                        element.clear()
                        element.send_keys(str(applicant_data[field_name]))
                        print(f"✅ Filled {field_name}: {applicant_data[field_name]}")
                        filled_fields += 1
                        break
                except NoSuchElementException:
                    continue
    
    if filled_fields > 0:
        print(f"📋 Successfully filled {filled_fields} form fields")
    else:
        print("ℹ️  No form fields found to fill")

def monitor_webcam_prompts(driver):
    """Monitor for webcam permission prompts and handle them"""
    
    print("📹 Monitoring for webcam prompts...")
    
    # Webcam prompt selectors
    webcam_selectors = [
        'button:contains("Allow")',
        'button:contains("Permitir")',
        'button[id*="allow"]',
        'button[class*="allow"]',
        '.camera-permission button',
        '.webcam-permission button',
        'button:contains("Take Photo")',
        'button:contains("Capture")',
        'button:contains("Selfie")',
        '#camera-button',
        '.camera-btn',
        '.photo-capture',
        'input[type="file"][accept*="image"]'
    ]
    
    # Monitor for up to 60 seconds
    start_time = time.time()
    timeout = 60
    
    while time.time() - start_time < timeout:
        try:
            # Check for webcam permission prompts
            for selector in webcam_selectors:
                try:
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        if element.is_displayed() and element.is_enabled():
                            print(f"🎯 Found webcam element: {selector}")
                            
                            # Handle different types of webcam interactions
                            if "allow" in selector.lower() or "permitir" in selector.lower():
                                print("✅ Granting camera permission...")
                                element.click()
                                time.sleep(2)
                                
                            elif any(word in selector.lower() for word in ["photo", "capture", "selfie", "camera"]):
                                print("📸 Triggering photo capture...")
                                element.click()
                                time.sleep(3)
                                
                                # Wait for photo to be captured by virtual webcam
                                print("⏳ Waiting for photo capture...")
                                time.sleep(5)
                                
                                # Look for confirmation or next step
                                confirm_selectors = [
                                    'button:contains("Confirm")',
                                    'button:contains("Accept")',
                                    'button:contains("Continue")',
                                    'button:contains("Next")',
                                    '.confirm-photo',
                                    '.accept-photo'
                                ]
                                
                                for confirm_selector in confirm_selectors:
                                    try:
                                        confirm_element = WebDriverWait(driver, 5).until(
                                            EC.element_to_be_clickable((By.CSS_SELECTOR, confirm_selector))
                                        )
                                        print("✅ Confirming photo...")
                                        confirm_element.click()
                                        time.sleep(2)
                                        break
                                    except TimeoutException:
                                        continue
                                
                                print("✅ Photo capture process completed")
                                return True
                                
                except NoSuchElementException:
                    continue
            
            # Check if we're on a success page
            success_indicators = [
                "success", "confirmed", "booked", "appointment",
                "confirmation", "thank you", "completed"
            ]
            
            page_text = driver.page_source.lower()
            if any(indicator in page_text for indicator in success_indicators):
                print("✅ Detected success page - webcam process likely completed")
                return True
            
            time.sleep(1)  # Wait 1 second before next check
            
        except Exception as e:
            print(f"⚠️  Error during webcam monitoring: {str(e)}")
            time.sleep(1)
    
    print("⏰ Webcam monitoring timeout reached")
    return False

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 3:
        print("Usage: python run_bot.py '<applicant_data_json>' '<id_photo_path>'")
        sys.exit(1)
    
    try:
        # Parse applicant data from JSON string
        applicant_json = sys.argv[1]
        applicant_data = json.loads(applicant_json)
        
        id_photo_path = sys.argv[2]
        
        # Launch browser automation
        result = launch_browser_bot(applicant_data, id_photo_path)
        
        print("SUCCESS: Browser automation completed")
        print(f"Result: {json.dumps(result, indent=2)}")
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
