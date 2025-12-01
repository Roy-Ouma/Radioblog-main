const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.url; // image URL
};
