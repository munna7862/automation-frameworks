## Hybrid API + UI Authentication

This framework supports API-based authentication to:
- Reduce UI login flakiness
- Improve execution speed
- Enable stable authenticated UI testing

Flow:
1. Login via API
2. Extract auth token
3. Inject token into browser context
4. Launch UI in authenticated state
