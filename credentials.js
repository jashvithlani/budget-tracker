// ============================================
// BUDGET TRACKER - MULTI-USER CREDENTIALS
// ============================================
// 
// Add as many users as you want!
// Each user will have their own separate budget data.
//

module.exports = {
  users: [
    {
      id: 1,
      username: 'jashvithlani',
      password: 'Tokyo@1234',
      displayName: 'Jash Vithlani'
    },
    {
      id: 2,
      username: 'dskantaria',
      password: 'Dhaval@1234',
      displayName: 'Dhaval Kantaria'
    }
    // Add more users here:
    // {
    //   id: 3,
    //   username: 'username',
    //   password: 'password',
    //   displayName: 'Display Name'
    // }
  ],
  
  // Session secret (change this to something random)
  sessionSecret: 'mybudget-secret-key-change-this-12345'
};

// ============================================
// INSTRUCTIONS TO ADD NEW USER:
// ============================================
// 1. Copy the user object template above
// 2. Increment the id (3, 4, 5, etc.)
// 3. Set unique username
// 4. Set password
// 5. Set display name
// 6. Save file and restart server
// 7. Commit and push to GitHub
// 8. Render auto-deploys with new user!
// ============================================
