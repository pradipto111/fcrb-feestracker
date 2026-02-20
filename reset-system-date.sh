#!/bin/bash

echo "🔄 Resetting system date to actual current date..."
echo ""

# Get the admin token (you'll need to login first)
echo "Please provide admin credentials:"
read -p "Email (default: admin@fcrb.com): " EMAIL
EMAIL=${EMAIL:-admin@fcrb.com}
read -sp "Password (default: 20fc24rb!): " PASSWORD
echo ""
PASSWORD=${PASSWORD:-20fc24rb!}

echo ""
echo "Logging in..."

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Please check your credentials and ensure the backend is running."
  exit 1
fi

echo "✅ Login successful!"
echo ""
echo "Resetting system date..."

# Reset system date
RESPONSE=$(curl -s -X DELETE http://localhost:4000/system/date \
  -H "Authorization: Bearer $TOKEN")

echo "✅ System date reset to actual current date!"
echo ""
echo "Response: $RESPONSE"
echo ""
echo "Please refresh your browser to see the updated date."






