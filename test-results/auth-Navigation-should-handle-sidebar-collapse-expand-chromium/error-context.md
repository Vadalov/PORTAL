# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
        - img [ref=e8]
    - alert [ref=e11]
    - generic [ref=e13]:
        - generic [ref=e14]:
            - generic [ref=e15]: Dernek Yönetim Sistemi
            - paragraph [ref=e16]: Hesabınıza giriş yapın
        - generic [ref=e18]:
            - generic [ref=e19]:
                - generic [ref=e21]: E-posta
                - textbox "E-posta" [ref=e22]:
                    - /placeholder: ornek@email.com
                    - text: admin@test.com
            - generic [ref=e23]:
                - generic [ref=e25]: Şifre
                - textbox "Şifre" [ref=e26]:
                    - /placeholder: ••••••••
                    - text: admin123
            - button "Giriş Yap" [ref=e27]
            - generic [ref=e28]:
                - paragraph [ref=e29]: 'Test Hesapları:'
                - generic [ref=e30]:
                    - paragraph [ref=e31]: 'Admin: admin@test.com / admin123'
                    - paragraph [ref=e32]: 'Manager: manager@test.com / manager123'
                    - paragraph [ref=e33]: 'Member: member@test.com / member123'
                    - paragraph [ref=e34]: 'Viewer: viewer@test.com / viewer123'
    - region "Notifications alt+T"
    - generic [ref=e35]:
        - img [ref=e37]
        - button "Open Tanstack query devtools" [ref=e85] [cursor=pointer]:
            - img [ref=e86]
```
