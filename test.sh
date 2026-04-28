#!/bin/bash

# הגדרת כתובת השרת
BASE_URL="http://localhost:5000/api"

# יצירת מספר חדר ייחודי
UNIQUE_NUM=$((100 + $RANDOM % 900))
echo "--- 1. יצירת חדר חדש (מספר $UNIQUE_NUM) ---"

# הסרנו את roomType כדי להשתמש בברירת המחדל "כיתה" מהמודל ולמנוע שגיאות קידוד
ROOM_RES=$(curl -s -X POST "$BASE_URL/rooms" \
     -H "Content-Type: application/json" \
     -d "{\"roomNumber\": \"$UNIQUE_NUM\", \"wing\": \"A\", \"floor\": 1, \"size\": 30}")

echo "תגובה גולמית מהשרת: $ROOM_RES"

# חילוץ ה-ID בעזרת sed
ROOM_ID=$(echo $ROOM_RES | sed -n 's/.*"_id":"\([^"]*\)".*/\1/p')

if [ -z "$ROOM_ID" ]; then
    echo "❌ שגיאה: לא ניתן היה לחלץ מזהה חדר."
    exit 1
fi

echo "✅ נוצר חדר עם מזהה: $ROOM_ID"

echo -e "\n--- 2. יצירת שיבוץ קבוע (יום שני, 10:00-12:00) ---"
ALLOC_RES=$(curl -s -X POST "$BASE_URL/allocations" \
     -H "Content-Type: application/json" \
     -d "{\"room\": \"$ROOM_ID\", \"requesterName\": \"ישראל ישראלי\", \"kind\": \"permanent\", \"dayOfWeek\": 1, \"startTime\": \"10:00\", \"endTime\": \"12:00\"}")

echo "תגובה: $ALLOC_RES"
ALLOC_ID=$(echo $ALLOC_RES | sed -n 's/.*"_id":"\([^"]*\)".*/\1/p')

echo -e "\n--- 3. ניסיון ליצירת שיבוץ חופף (צריך להיכשל) ---"
curl -X POST "$BASE_URL/allocations" \
     -H "Content-Type: application/json" \
     -d "{\"room\": \"$ROOM_ID\", \"requesterName\": \"בדיקה\", \"kind\": \"temporary\", \"startDate\": \"2024-05-20\", \"startTime\": \"11:00\", \"endTime\": \"13:00\"}"

echo -e "\n\n--- 4. חיפוש חדרים פנויים (החדר לא אמור להופיע) ---"
curl -s -G "$BASE_URL/cancellations/available" \
     --data-urlencode "date=2024-05-20" \
     --data-urlencode "startTime=11:00" \
     --data-urlencode "endTime=11:30"

echo -e "\n\n--- 5. יצירת ביטול שמשחרר את החדר ---"
curl -s -X POST "$BASE_URL/cancellations" \
     -H "Content-Type: application/json" \
     -d "{\"room\": \"$ROOM_ID\", \"date\": \"2024-05-20\", \"startTime\": \"10:00\", \"endTime\": \"12:00\", \"cancelledBy\": \"מנהל\", \"reason\": \"תחזוקה\"}"

echo -e "\n\n--- 6. חיפוש חדרים פנויים שוב (החדר אמור להופיע כעת) ---"
curl -s -G "$BASE_URL/cancellations/available" \
     --data-urlencode "date=2024-05-20" \
     --data-urlencode "startTime=11:00" \
     --data-urlencode "endTime=11:30"

echo -e "\n\n--- 7. מחיקת החדר וניקוי נתונים ---"
curl -s -X DELETE "$BASE_URL/rooms/$ROOM_ID"
echo -e "\nבדיקה הסתיימה."