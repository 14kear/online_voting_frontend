function AdminPage() {
  return (
    <div style={{ height: '100vh' }}>
      <iframe
        src="http://localhost:4200/login"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Admin Panel"
      />
    </div>
  );
}

export default AdminPage;
