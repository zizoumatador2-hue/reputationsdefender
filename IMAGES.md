# Generated Images — Action Required Before Launch

This sandbox's network allowlist blocks the fal.media CDN for direct downloads (curl/WebFetch), so these 15 images were generated successfully via fal.ai (`fal-ai/flux-2/flash`, ~$0.005/megapixel ≈ **under $0.07 total** for all 15) but could **not** be downloaded into the project's `public/images/` folder from here.

**Before deploying, download each URL below and save it to `public/images/` using the exact filename shown**, then the code (already wired to these filenames) will work without further changes. A one-line way to do this on your own machine once you have the repo:

```bash
cd public/images
curl -o logo-source.png "https://v3b.fal.media/files/b/0aad9fa1/J0g3Rlfvy2sFmBU-G5jWA_27Ev9eTY.png"
# ...repeat for each URL below
```

| Filename | Use | URL |
|---|---|---|
| `logo-source.png` | Site logo / favicon source (512×512) | https://v3b.fal.media/files/b/0aad9fa1/J0g3Rlfvy2sFmBU-G5jWA_27Ev9eTY.png |
| `home-office-woman.jpg` | Lifestyle — privacy guides | https://v3b.fal.media/files/b/0aad9fa1/LhGMOAl3-Yj_nSw8aqJqP_hyfjWEjP.jpg |
| `typing-search.jpg` | Lifestyle — Google search articles | https://v3b.fal.media/files/b/0aad9fa1/iBWBM3-xcLJmxUu7X8dQY_jar1XFpQ.jpg |
| `privacy-padlock.jpg` | Conceptual — personal privacy | https://v3b.fal.media/files/b/0aad9fa1/3Fi3NYdeffYtFIEH3sFdv_OZjqpfxQ.jpg |
| `relieved-man-call.jpg` | Lifestyle — reputation resolved | https://v3b.fal.media/files/b/0aad9fa1/o90q8gdZanQ9l5_zHl7Ch_NFThvl5N.jpg |
| `search-visibility-illustration.png` | Flat illustration — Google search | https://v3b.fal.media/files/b/0aad9fa1/COwG9HfkANip1ziF1t9d3_WUMgJ4il.png |
| `shield-privacy-illustration.png` | Flat illustration — personal privacy | https://v3b.fal.media/files/b/0aad9fa1/0wRmUx1GNcn533XROCn1w_yXTVWUsi.png |
| `business-owner-reviews.jpg` | Lifestyle — business reputation | https://v3b.fal.media/files/b/0aad9fa1/PCiRoJYSwTtAgV4Nw2m0k_y6DwtWsC.jpg |
| `content-removal-illustration.png` | Flat illustration — info removal | https://v3b.fal.media/files/b/0aad9fa2/n-n0SHGDDTXfq1MfQvZST_9UQZPok3.png |
| `senior-man-tablet.jpg` | Lifestyle — monitoring guide | https://v3b.fal.media/files/b/0aad9fa2/EC234Embu2Ceuyzuo6L20_zLTKdYNg.jpg |
| `data-broker-optout-illustration.png` | Flat illustration — data brokers | https://v3b.fal.media/files/b/0aad9fa2/Eal5jsv_e2ql-U-12tPXr_cbYlRpGA.png |
| `team-office.jpg` | Lifestyle — about/business pages | https://v3b.fal.media/files/b/0aad9fa2/TW8mvJDO-vbcHhdgE3F8D_dNPi8mn8.jpg |
| `reviews-illustration.png` | Flat illustration — online reviews | https://v3b.fal.media/files/b/0aad9fa2/HlZ-LlUrRI8lL5LBivVpb_ZdijcBeY.png |
| `phone-privacy-closeup.jpg` | Lifestyle — privacy settings | https://v3b.fal.media/files/b/0aad9fa2/Fy8lx4gOGO4US6MasRnup_MGX4BmDk.jpg |
| `hero-banner-woman.jpg` | Homepage hero banner (1600×928) | https://v3b.fal.media/files/b/0aad9fa2/PK7b9UtmoQdiarYVjmoX7_67DD53tl.jpg |

All 15 are also saved to your fal.ai asset library (account: Zizou Matador) if the direct URLs ever expire — you can re-export from there.

## Still needed after downloading
- Crop/export `logo-source.png` into `logo.png` (36×36 and 32×32 used in header/footer) and a `favicon.png`.
- Create an `og-default.jpg` (1200×630) for social sharing — can reuse `hero-banner-woman.jpg` cropped.
- Run all images through compression (Squoosh or `sharp`) and export WebP/AVIF versions per the performance requirements in the original brief — this wasn't done here since it requires the files to exist locally first.
