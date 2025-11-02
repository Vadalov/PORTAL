# GitHub MCP Server Kurulumu

Bu doküman, PORTAL projesi için GitHub Model Context Protocol (MCP) server kurulumunu açıklar.

## 🎯 Ne İçin Kullanılır?

GitHub MCP server, Claude Desktop üzerinden GitHub ile doğrudan etkileşim kurmanızı sağlar:

- ✅ Repository yönetimi
- ✅ Issue ve Pull Request yönetimi
- ✅ Kod arama ve inceleme
- ✅ Branch ve commit işlemleri
- ✅ GitHub Actions workflow tetikleme
- ✅ Otomatik kod review

## 🚀 Hızlı Kurulum

### 1. GitHub Personal Access Token (PAT) Oluşturma

1. GitHub'da [Personal Access Token sayfasına](https://github.com/settings/tokens/new) gidin
2. Token açıklaması ekleyin (örn: "Claude MCP Server")
3. Aşağıdaki yetkileri seçin:
   - ✅ **repo** (tüm repository erişimi)
   - ✅ **workflow** (GitHub Actions)
   - ✅ **read:org** (organizasyon bilgileri)
   - ✅ **read:user** (kullanıcı profili)
   - ✅ **user:email** (email adresi)
4. "Generate token" butonuna tıklayın
5. Token'ı güvenli bir yere kaydedin (tekrar gösterilmeyecek!)

### 2. Token'ı Ortam Değişkeni Olarak Ayarlama

**Geçici (sadece mevcut oturum):**

```bash
export GITHUB_TOKEN='ghp_your_token_here'
```

**Kalıcı (her oturum için):**

```bash
echo 'export GITHUB_TOKEN="ghp_your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Kurulum Scriptini Çalıştırma

```bash
./setup-mcp-github.sh
```

Bu script:

- ✅ Token'ın varlığını kontrol eder
- ✅ `~/.config/claude/mcp.json` oluşturur
- ✅ Mevcut varsa yedek alır
- ✅ GitHub MCP server yapılandırmasını ekler

### 4. Claude Desktop'ı Yeniden Başlatma

Kurulum tamamlandıktan sonra Claude Desktop uygulamasını kapatıp yeniden açın.

## 📋 Manuel Kurulum

Eğer script kullanmak istemiyorsanız:

1. Config dizini oluşturun:

```bash
mkdir -p ~/.config/claude
```

2. `~/.config/claude/mcp.json` dosyasını oluşturun:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

3. Token'ınızı dosyaya ekleyin (yukarıdaki `your_github_token_here` kısmını değiştirin)

## 🧪 Test Etme

Claude Desktop'ta şu komutları deneyebilirsiniz:

1. **Repository bilgilerini getir:**

   ```
   Vadalov/PORTAL repository'sindeki son issue'ları listele
   ```

2. **Dosya içeriğini oku:**

   ```
   PORTAL projesindeki package.json dosyasını göster
   ```

3. **Issue oluştur:**

   ```
   PORTAL projesinde yeni bir issue oluştur
   ```

4. **Pull Request oluştur:**
   ```
   Yeni bir branch oluştur ve pull request aç
   ```

## 🔧 Troubleshooting

### Token tanınmıyor

```bash
# Token'ın ayarlı olduğunu kontrol edin
echo $GITHUB_TOKEN

# Eğer boşsa, tekrar ayarlayın
export GITHUB_TOKEN='your_token_here'
```

### MCP server çalışmıyor

```bash
# Config dosyasını kontrol edin
cat ~/.config/claude/mcp.json

# npx'in çalıştığını doğrulayın
npx -y @modelcontextprotocol/server-github --help
```

### Claude Desktop görmüyor

1. Claude Desktop'ı tamamen kapatın (sistem tray'den de)
2. Tekrar açın
3. Ayarlar > MCP kısmından "github" server'ını kontrol edin

## 📚 Kullanılabilir Komutlar

MCP GitHub server ile yapabilecekleriniz:

### Repository İşlemleri

- Repository bilgilerini getirme
- Dosya içeriklerini okuma/yazma
- Branch oluşturma/listeleme
- Fork oluşturma

### Issue Yönetimi

- Issue listeleme/arama
- Issue oluşturma/güncelleme
- Yorum ekleme
- Label ve milestone yönetimi

### Pull Request İşlemleri

- PR listeleme/arama
- PR oluşturma/güncelleme
- Review ekleme
- Merge işlemleri

### Kod Arama

- Repository'lerde kod arama
- Kullanıcı arama
- Issue/PR arama

### Git İşlemleri

- Commit listeleme/görüntüleme
- Branch yönetimi
- Tag işlemleri
- Release yönetimi

## 🔒 Güvenlik

- ⚠️ GitHub token'ınızı asla git repository'ye commit etmeyin
- ✅ `.env.local` veya ortam değişkenlerinde saklayın
- ✅ Token'a sadece gerekli yetkileri verin
- ✅ Düzenli olarak token'ları yenileyin
- ✅ Kullanılmayan token'ları silin

## 📖 Daha Fazla Bilgi

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [GitHub MCP Server Repository](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## 🤝 PORTAL Projesi İçin Özel Kullanım

Bu proje için MCP server özellikle faydalı:

1. **Automated Code Reviews**: PR'ları otomatik inceleyebilir
2. **Issue Tracking**: Issue'ları doğrudan Claude üzerinden yönetebilir
3. **Documentation Updates**: Dokümanları otomatik güncelleyebilir
4. **Code Search**: Kod tabanında hızlı arama yapabilir
5. **CI/CD Integration**: GitHub Actions workflow'larını tetikleyebilir

## 📝 Notlar

- Bu kurulum sadece Claude Desktop için geçerlidir
- VS Code gibi diğer editörler için ayrı yapılandırma gerekir
- Token yetkilerini proje ihtiyaçlarına göre ayarlayın
