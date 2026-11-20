import './App.css'

function App() {
  return (
    <main className="demo-shell">
      <iframe
        className="demo-frame"
        src={`${import.meta.env.BASE_URL}demo.html`}
        title="Enkostay 가상 매물 필터 데모"
      />
    </main>
  )
}

export default App
