# Feature Ideas

## Core Features (MVP)

### Authentication

- [ ] Email/password login
- [ ] Google OAuth
- [ ] Logout
- [ ] Session persistence

### Groups

- [ ] Create new group
- [ ] View group list
- [ ] View group details
- [ ] Add/remove members
- [ ] Delete group

### Bills

- [ ] Create new bill
- [ ] Add items to bill
- [ ] Assign items to members
- [ ] View bill details
- [ ] Edit/delete bill

### Splits

- [ ] Equal split (divide by N)
- [ ] By item (who ordered what)
- [ ] Percentage split
- [ ] Custom amounts
- [ ] View who owes whom

### Balance

- [ ] See current balance per group
- [ ] See total owed/owed to you
- [ ] Mark as settled
- [ ] Payment history

## Future Features (Post-MVP)

### Enhanced Splitting

- [ ] Tax and tip calculation
- [ ] Service charge handling
- [ ] Currency conversion
- [ ] Multiple payment methods
- [ ] Recurring bills (subscriptions)

### Social Features

- [ ] Activity feed
- [ ] Comments on bills
- [ ] Reactions/emojis
- [ ] Group chat integration
- [ ] Payment reminders

### Receipt Management

- [ ] Upload receipt photo
- [ ] OCR receipt scanning
- [ ] Attach receipt to bill
- [ ] Receipt history

### Analytics & Reports

- [ ] Spending by category
- [ ] Monthly reports
- [ ] Group statistics
- [ ] Export to CSV
- [ ] Expense trends

### UX Improvements

- [ ] Dark mode
- [ ] Offline mode
- [ ] Push notifications
- [ ] In-app tutorials
- [ ] Quick actions/shortcuts

### Integration

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Calendar integration
- [ ] Export to Google Sheets
- [ ] Slack/Discord bots

### Gamification

- [ ] Badges/achievements
- [ ] Leaderboard (fastest payers)
- [ ] Streak tracking
- [ ] Profile customization

## User Stories

### As a user, I want to...

- Quickly add a bill after dining with friends
- See at a glance who owes me money
- Split a bill by specific items (not equally)
- Take a photo of the receipt for reference
- Get notified when someone pays me back
- See my spending history with a group
- Settle up multiple bills at once

### As a group admin, I want to...

- Invite friends to the group
- Remove inactive members
- Set group preferences (currency, rounding)
- Archive old bills
- Export group history

## Brainstorming Notes

### Pain Points We're Solving

1. Splitting bills manually is tedious
2. People forget who owes what
3. Uneven splitting (when people order different amounts)
4. Tracking across multiple events/bills
5. Awkwardness of asking friends for money

### Competitive Analysis

- **Splitwise**: Full-featured but cluttered UI
- **Venmo**: Easy payments but weak bill splitting
- **Tricount**: Good for trips but not daily use
- **Tab**: Simple but limited features

### Our Differentiator

- **Beautiful, modern UI** with Tamagui
- **Real-time sync** - see changes instantly
- **Cross-platform** - works everywhere
- **Free and open-source**
- **Privacy-focused** - you own your data

### Technical Considerations

- Keep app size small (<10MB)
- Offline-first architecture
- Fast load times (<2s)
- Smooth animations (60fps)
- Accessible to screen readers
