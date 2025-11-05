# Kumbara Kayıt Sorunu - Çözüm

## Sorun
Kumbara kayıtları oluşturulurken `is_kumbara` ve diğer kumbara-specific field'lar Convex veritabanına kaydedilmiyordu.

## Neden
`convex/donations.ts` dosyasındaki `create` mutation'ında kumbara-specific field'lar tanımlı değildi:
- `is_kumbara`
- `kumbara_location`
- `collection_date`
- `kumbara_institution`
- `location_coordinates`
- `location_address`
- `route_points`
- `route_distance`
- `route_duration`

## Çözüm
`convex/donations.ts` dosyasındaki `create` mutation'ına kumbara-specific field'lar eklendi.

## Değişiklikler

### Dosya: `convex/donations.ts`

**Önce:**
```typescript
export const create = mutation({
  args: {
    donor_name: v.string(),
    donor_phone: v.string(),
    // ... diğer field'lar
    // ❌ Kumbara field'ları yok
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", args);
  },
});
```

**Sonra:**
```typescript
export const create = mutation({
  args: {
    donor_name: v.string(),
    donor_phone: v.string(),
    // ... diğer field'lar
    // ✅ Kumbara-specific fields eklendi
    is_kumbara: v.optional(v.boolean()),
    kumbara_location: v.optional(v.string()),
    collection_date: v.optional(v.string()),
    kumbara_institution: v.optional(v.string()),
    location_coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    location_address: v.optional(v.string()),
    route_points: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
    route_distance: v.optional(v.number()),
    route_duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", args);
  },
});
```

## Test

Şimdi kumbara kayıtları:
1. ✅ Formdan oluşturulabilir
2. ✅ `is_kumbara: true` ile kaydedilir
3. ✅ Kumbara-specific field'lar kaydedilir
4. ✅ Kumbara listesi sayfasında görünür
5. ✅ `is_kumbara: true` filtresi ile sorgulanabilir

## Sonuç

Kumbara kayıtları artık tam olarak Convex veritabanına kaydediliyor ve liste sayfasında görüntülenebiliyor.

