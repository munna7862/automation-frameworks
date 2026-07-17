# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "BuggyBooks" [ref=e5] [cursor=pointer]:
      - /url: /
      - heading "BuggyBooks" [level=2] [ref=e6]
    - navigation [ref=e7]:
      - link "Catalog" [ref=e8] [cursor=pointer]:
        - /url: /
      - link "Login" [ref=e9] [cursor=pointer]:
        - /url: /login
      - link "Sign Up" [ref=e10] [cursor=pointer]:
        - /url: /register
  - main [ref=e11]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - heading "Welcome Back" [level=1] [ref=e15]
        - paragraph [ref=e16]: Sign in to continue to BuggyBooks.
      - generic [ref=e17]:
        - img [ref=e18]
        - text: "Expected JSON response but received text/html; charset=utf-8. This often happens when the API URL is incorrect or the server is returning an HTML error page. Response start: Too many requests, please try again later...."
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Username
          - textbox "Enter your username" [ref=e23]: admin
        - generic [ref=e24]:
          - generic [ref=e25]: Password
          - textbox "••••••••" [ref=e26]: password123
        - button "Sign In" [ref=e27] [cursor=pointer]
      - generic [ref=e28]:
        - text: Don't have an account?
        - link "Sign up here" [ref=e29] [cursor=pointer]:
          - /url: /register
```