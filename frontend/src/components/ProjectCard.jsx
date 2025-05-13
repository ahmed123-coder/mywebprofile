import { Col } from "react-bootstrap";

export const ProjectCard = ({ title, description, imgUrl }) => {
  return (
    <Col size={12} sm={6} md={4}>
      <div className="proj-imgbx">
        {imgUrl && (() => {
  console.log("قيمة imgUrlhero:", imgUrl);

  // تنظيف المسار من الباكسلاش
  const cleanedPath = imgUrl.replace(/\\/g, '/');

  // التحقق إذا كان يحتوي على http
  const fullUrl = cleanedPath.startsWith('http')
    ? cleanedPath
<<<<<<< HEAD
    : `http://localhost:3000/${cleanedPath}`;

  console.log("✅ Final imgUrlcard path:", fullUrl);
=======
    : `https://ahmedkhmiri.onrender.com/${cleanedPath}`;

  console.log("✅ Final imgUrlhero path:", fullUrl);
>>>>>>> a9a21085fb0d6df9a2e3c40407cc7b87675db24d

  return <img src={fullUrl} alt="Header Img" className="imgUrl"/>;
})()}
        <div className="proj-txtx">
          <h4>{title}</h4>
          <span>{description}</span>
        </div>
      </div>
    </Col>
  )
}
