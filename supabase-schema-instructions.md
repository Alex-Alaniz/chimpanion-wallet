# Running Database Schema in Supabase

Since the direct psql connection has issues with the URL format, please follow these steps to run the schema in Supabase:

## Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the **SQL Editor** tab (usually in the left sidebar)

2. **Create New Query**
   - Click "New query" or "+ New"

3. **Copy Schema**
   - Copy the entire contents of `src/lib/database/schema.sql`

4. **Paste and Run**
   - Paste the schema into the SQL editor
   - Click "Run" or press Ctrl/Cmd + Enter

## Expected Result:

You should see success messages for:
- ✅ Created enum type `auth_method`
- ✅ Created table `user_wallets`
- ✅ Created table `wallet_transactions`
- ✅ Created table `user_subscriptions`
- ✅ Created table `chat_sessions`
- ✅ Created table `chat_messages`
- ✅ Created all indexes
- ✅ Created trigger function

## Verify Tables:

After running, you can verify by running:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- user_wallets
- wallet_transactions
- user_subscriptions
- chat_sessions
- chat_messages 