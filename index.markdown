---
---

<head>
  <title>Index of /</title>
</head>

<body>
  <h1>Index of /</h1>
  <ul>
    {% assign top_level_dirs = site.static_files | map: "path" | map: "split:'/'" | map: "first" | uniq %}
    {% for dir in top_level_dirs %}
    <li>
      <a href="{{ site.baseurl | escape }}/{{ dir }}">{{ dir }}</a>
    </li>
    {% endfor %}
  </ul>
</body>
