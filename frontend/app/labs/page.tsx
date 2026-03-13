"use client"

export default function Labs() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Virtual Coding Labs</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-2xl mb-4">Monaco Editor + Xterm</h2>
          <p>Docker container per student (Rust backend)</p>
          <p>POST localhost:8081/api/labs/start for pod</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg rounded-xl p-8">
          <h2 className="text-2xl mb-4">Kubernetes Ready</h2>
          <p>Scale to 1000s concurrent labs</p>
        </div>
      </div>
    </div>
  )
}

