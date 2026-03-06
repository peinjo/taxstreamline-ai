

## Fix: jspdf peer dependency conflict

The issue is that `jspdf-autotable@3.8.4` requires `jspdf@^2.5.1` as a peer dependency, but your project has `jspdf@^4.1.0` installed. These are incompatible.

### Change

In `package.json`, downgrade jspdf:

```
"jspdf": "^4.1.0"  →  "jspdf": "^2.5.2"
```

This is the only change needed. The `jspdf` v2 API is largely the same for the features used in this project (PDF generation), so no code changes are required.

