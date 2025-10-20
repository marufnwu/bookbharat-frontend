# 📱 Admin Quick Start Guide - Notification System

## 🚀 **Get Started in 5 Minutes**

### **Step 1: Access Notification Settings**
1. Login to admin panel at: `http://your-domain.com/admin`
2. Navigate to: **Settings → Notifications**
3. You'll see 4 tabs: Event Channels, SMS Gateway, WhatsApp API, Email Config

---

## 📧 **Email Setup (Already Configured)**

Email is ready to use via SMTP. No additional configuration needed unless you want to change the from address.

**Test Email:**
1. Go to "Email Config" tab
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox

---

## 📱 **SMS Setup (Optional)**

### **Prerequisites:**
- SMS gateway account (any provider: MSG91, Fast2SMS, Twilio, etc.)
- API endpoint URL
- API key

### **Configuration:**
1. Go to "SMS Gateway" tab
2. Enter:
   - **Gateway URL**: `https://api.your-sms-provider.com/send`
   - **API Key**: Your API key (will be encrypted)
   - **Sender ID**: `BKBHRT` (or your approved sender ID)
   - **Request Format**: Choose `JSON` or `Form`

3. Click "Save Configuration"

### **Test:**
1. Enter a test phone number (10 digits)
2. Click "Test SMS"
3. Check your phone for test message

---

## 💬 **WhatsApp Setup (Optional)**

### **Prerequisites:**
- WhatsApp Business Account (https://business.facebook.com)
- Approved phone number
- Approved message templates

### **Get Credentials:**
1. Go to Meta Business Manager
2. Open WhatsApp → API Setup
3. Copy:
   - Phone Number ID
   - Access Token
   - Business Account ID

### **Configuration:**
1. Go to "WhatsApp API" tab
2. Enter:
   - **API URL**: `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID`
   - **Access Token**: Your token (will be encrypted)
   - **Phone Number ID**: From Meta dashboard
   - **Business Account ID**: From Meta dashboard

3. Click "Save Configuration"

### **Sync Templates:**
1. Click "Sync Templates" button
2. Wait for templates to load
3. Review approved templates list

### **Test:**
1. Enter a test WhatsApp number (10 digits)
2. Click "Test WhatsApp"
3. Check WhatsApp for test message

---

## ⚙️ **Configure Notification Channels**

### **Event Channels Tab:**

For each event, you can enable/disable channels:

| Event | Recommended Channels |
|-------|---------------------|
| Order Placed | ✅ Email, ✅ SMS |
| Order Shipped | ✅ Email, ✅ SMS, ✅ WhatsApp |
| Order Delivered | ✅ Email, ✅ WhatsApp |
| Payment Failed | ✅ Email, ✅ SMS |
| Abandoned Cart | ✅ Email only |
| Review Request | ✅ Email only |

### **How to Configure:**
1. Go to "Event Channels" tab
2. For each event, click the channel icons to enable/disable:
   - 📧 Email icon - Toggle email
   - 📱 Phone icon - Toggle SMS
   - 💬 Chat icon - Toggle WhatsApp
3. Use the master toggle to enable/disable entire event
4. Changes save automatically

---

## 🔔 **Notification Events**

### **Automated (No action needed):**
- ✅ **Abandoned Cart Recovery**
  - First email: 1 hour after cart abandoned (no discount)
  - Second email: 24 hours later (5% discount)
  - Final email: 48 hours later (10% discount)

- ✅ **Review Requests**
  - Sent automatically 3-7 days after delivery
  - Only for delivered orders
  - Only if customer hasn't reviewed

### **Manual (Triggered by actions):**
- Order Placed
- Order Confirmed
- Order Shipped
- Order Delivered
- Order Cancelled
- Payment Success/Failed
- Return Updates
- Password Reset
- Welcome Email

---

## ✅ **Verification Checklist**

After configuration, verify:

- [ ] Test email sent successfully
- [ ] Test SMS sent successfully (if configured)
- [ ] Test WhatsApp sent successfully (if configured)
- [ ] Event channels configured as desired
- [ ] Templates synced (for WhatsApp)
- [ ] Credentials saved (check settings persist after refresh)

---

## 🆘 **Troubleshooting**

### **Email Not Sending:**
- Check SMTP credentials in .env file
- Verify email address is correct
- Check spam folder
- Contact hosting provider to enable outgoing email

### **SMS Not Sending:**
- Verify SMS gateway URL is correct
- Check API key is valid
- Ensure phone number is 10 digits (no country code)
- Check SMS gateway dashboard for logs
- Click "Test SMS" to verify connection

### **WhatsApp Not Sending:**
- Verify WhatsApp Business Account is approved
- Check access token hasn't expired
- Ensure templates are approved (APPROVED status)
- Template names must match exactly
- Click "Sync Templates" to refresh
- Click "Test WhatsApp" to verify connection

### **Scheduled Emails Not Sending:**
- Verify cron job is running
- Or start scheduler manually: `php artisan schedule:work`
- Check queue worker is running: `php artisan queue:work`
- Contact developer to verify server cron setup

---

## 📞 **Need Help?**

### **Common Questions:**

**Q: How do I change which channels send for which events?**
A: Go to Event Channels tab, click the channel icons for each event.

**Q: How do I test if my setup is working?**
A: Each configuration tab has a "Test" button. Use your own phone/email.

**Q: Are my API keys secure?**
A: Yes! All API keys and tokens are encrypted in the database.

**Q: Can I use my own SMS provider?**
A: Yes! Any HTTP-based SMS API works. Just configure the endpoint and API key.

**Q: Do I need WhatsApp Business API or can I use WhatsApp Web?**
A: You need official WhatsApp Business API (requires Meta Business Account).

**Q: How do I approve WhatsApp templates?**
A: Create templates in Meta Business Manager, they'll be auto-approved in 24-48 hours.

---

## 💡 **Pro Tips**

1. **Start with Email Only:**
   - Email works out of the box
   - Add SMS/WhatsApp later when ready

2. **Test Everything First:**
   - Use test numbers/emails
   - Verify before enabling for customers

3. **Monitor Delivery:**
   - Check logs regularly initially
   - Ask developer to set up monitoring

4. **Progressive Rollout:**
   - Start with email
   - Add SMS for critical events
   - Add WhatsApp for high-value customers

5. **Template Management:**
   - Keep WhatsApp templates simple
   - Sync regularly to get new approvals
   - Map templates to correct events

---

## 🎯 **Quick Commands (For Developer)**

```bash
# Test abandoned cart emails
php artisan cart:send-abandoned-reminders --type=first

# View scheduled tasks
php artisan schedule:list

# Check queue jobs
php artisan queue:work

# View failed jobs
php artisan queue:failed
```

---

**This notification system puts you in complete control of customer communications!** 📧📱💬✨

