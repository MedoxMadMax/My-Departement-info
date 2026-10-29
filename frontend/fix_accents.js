import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminDashboard.jsx', 'utf8');

content = content.replace(/autoris\uFFFD+es/g, 'autorisées');
content = content.replace(/t\uFFFD+l\uFFFD+charg\uFFFD+e/g, 'téléchargée');
content = content.replace(/succ\uFFFD+s/g, 'succès');
content = content.replace(/t\uFFFD+l\uFFFD+chargement/g, 'téléchargement');
content = content.replace(/Param\uFFFD+tres/g, 'Paramètres');
content = content.replace(/l'\uFFFD+v\uFFFD+nement/g, "l'événement");
content = content.replace(/Publi\uFFFD+/g, 'Publié');
content = content.replace(/Refus\uFFFD+/g, 'Refusé');
content = content.replace(/int\uFFFD+gration/g, 'intégration');
content = content.replace(/l'vnement/g, "l'événement");
content = content.replace(/Paramtres/g, 'Paramètres');

fs.writeFileSync('src/pages/admin/AdminDashboard.jsx', content, 'utf8');
