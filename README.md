# אתר המרצים רון ליבנה וארז ליבנה

אתר סטטי בעברית המיועד ל־GitHub Pages. בשלב העבודה הנוכחי כל הקבצים נשמרים מקומית בלבד.

## תצוגה מקומית

```powershell
python -m http.server 8000
```

לאחר הפעלת השרת פותחים בדפדפן: `http://localhost:8000`.

## בדיקות

```powershell
python -m unittest discover -s tests -v
```

במחשב שבו פקודת `python` אינה מותקנת, יש להשתמש בנתיב של Python המותקן מקומית.
