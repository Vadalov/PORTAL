'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organization: {
      name: 'Dernek Yönetim Sistemi',
      address: '',
      phone: '',
      email: '',
    },
    email: {
      enabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
    },
    system: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      maintenanceMode: false,
    },
    security: {
      requireTwoFactor: false,
      passwordMinLength: 8,
      sessionTimeout: 30,
    },
  });

  const [activeTab, setActiveTab] = useState('organization');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    toast.success('Ayarlar başarıyla kaydedildi');
    setHasChanges(false);
  };

  const handleInitialize = () => {
    toast.success('Ayarlar başarıyla oluşturuldu');
    setHasChanges(true);
  };

  return (
    <div data-testid="settings-page" className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarlarını yapılandırın</p>
      </div>

      {!settings.organization.name ? (
        <Card>
          <CardHeader>
            <CardTitle>Ayarları Başlat</CardTitle>
            <CardDescription>
              İlk kez ayarları yapılandırıyorsunuz. Başlamak için aşağıdaki butona tıklayın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button data-testid="settings-initialize-button" onClick={handleInitialize}>
              Ayarları Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="settings-tabs-list">
            <TabsTrigger data-testid="settings-tab-organization" value="organization">
              Organizasyon
            </TabsTrigger>
            <TabsTrigger data-testid="settings-tab-email" value="email">
              E-posta
            </TabsTrigger>
            <TabsTrigger data-testid="settings-tab-notifications" value="notifications">
              Bildirimler
            </TabsTrigger>
            <TabsTrigger data-testid="settings-tab-system" value="system">
              Sistem
            </TabsTrigger>
            <TabsTrigger data-testid="settings-tab-security" value="security">
              Güvenlik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organizasyon Bilgileri</CardTitle>
                <CardDescription>Dernek organizasyon bilgilerini güncelleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organizasyon Adı *</Label>
                  <Input
                    id="org-name"
                    data-testid="settings-org-name"
                    value={settings.organization.name}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        organization: { ...prev.organization, name: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="org-address">Adres</Label>
                  <Input
                    id="org-address"
                    data-testid="settings-org-address"
                    value={settings.organization.address}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        organization: { ...prev.organization, address: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="org-phone">Telefon</Label>
                  <Input
                    id="org-phone"
                    data-testid="settings-org-phone"
                    value={settings.organization.phone}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        organization: { ...prev.organization, phone: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="org-email">E-posta</Label>
                  <Input
                    id="org-email"
                    data-testid="settings-org-email"
                    type="email"
                    value={settings.organization.email}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        organization: { ...prev.organization, email: e.target.value },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>E-posta Ayarları</CardTitle>
                <CardDescription>SMTP sunucu ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    data-testid="settings-smtp-enabled"
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        email: { ...prev.email, enabled: checked },
                      }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="smtp-enabled">SMTP Etkin</Label>
                </div>

                {settings.email.enabled && (
                  <>
                    <div>
                      <Label htmlFor="smtp-host">SMTP Sunucu *</Label>
                      <Input
                        id="smtp-host"
                        data-testid="settings-smtp-host"
                        value={settings.email.smtpHost}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, smtpHost: e.target.value },
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        data-testid="settings-smtp-port"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, smtpPort: parseInt(e.target.value) },
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-user">SMTP Kullanıcı</Label>
                      <Input
                        id="smtp-user"
                        data-testid="settings-smtp-user"
                        value={settings.email.smtpUser}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, smtpUser: e.target.value },
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-password">SMTP Şifre</Label>
                      <Input
                        id="smtp-password"
                        data-testid="settings-smtp-password"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, smtpPassword: e.target.value },
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="from-email">Gönderen E-posta</Label>
                      <Input
                        id="from-email"
                        data-testid="settings-from-email"
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, fromEmail: e.target.value },
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>Bildirim tercihlerini yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    data-testid="settings-email-notifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: checked },
                      }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    data-testid="settings-push-notifications"
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, pushNotifications: checked },
                      }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="push-notifications">Push Bildirimleri</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    data-testid="settings-sms-notifications"
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, smsNotifications: checked },
                      }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="sms-notifications">SMS Bildirimleri</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Sistem Ayarları</CardTitle>
                <CardDescription>Sistem genel ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Oturum Zaman Aşımı (dakika)</Label>
                  <Input
                    id="session-timeout"
                    data-testid="settings-session-timeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.system.sessionTimeout}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        system: { ...prev.system, sessionTimeout: parseInt(e.target.value) },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="max-login-attempts">Maksimum Giriş Denemesi</Label>
                  <Input
                    id="max-login-attempts"
                    data-testid="settings-max-login-attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.system.maxLoginAttempts}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        system: { ...prev.system, maxLoginAttempts: parseInt(e.target.value) },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    data-testid="settings-maintenance-mode"
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        system: { ...prev.system, maintenanceMode: checked },
                      }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="maintenance-mode">Bakım Modu</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
                <CardDescription>
                  Güvenlik ve kimlik doğrulama ayarlarını yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    data-testid="settings-require-two-factor"
                    checked={settings.security.requireTwoFactor}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, requireTwoFactor: checked },
                      }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor="require-two-factor">İki Faktörlü Kimlik Doğrulama</Label>
                </div>
                <div>
                  <Label htmlFor="password-min-length">Minimum Şifre Uzunluğu</Label>
                  <Input
                    id="password-min-length"
                    data-testid="settings-password-min-length"
                    type="number"
                    min="6"
                    max="20"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, passwordMinLength: parseInt(e.target.value) },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="security-session-timeout">
                    Güvenlik Oturum Zaman Aşımı (dakika)
                  </Label>
                  <Input
                    id="security-session-timeout"
                    data-testid="settings-security-session-timeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: parseInt(e.target.value) },
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button data-testid="settings-save-button" onClick={handleSave} disabled={!hasChanges}>
              Kaydet
            </Button>
          </div>
        </Tabs>
      )}
    </div>
  );
}
