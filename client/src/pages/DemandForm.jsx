// client/src/pages/DemandForm.jsx
import { useState } from 'react'
import axios from 'axios'
export default function DemandForm({ onSubmit }) {
 const [form, setForm] = useState({ title:'',description:'',submitter:'',bu:'' })
 const [result, setResult] = useState(null)
 const [loading, setLoading] = useState(false)
 const submit = async () => {
    setLoading(true)
 const { data } = await axios.post('http://localhost:5000/api/demand/submit', form)
 setResult(data)
 setLoading(false)
 }
 if (result) return (
 <div className='p-8 max-w-2xl mx-auto'>
 <h2 className='text-2xl font-bold text-green-700 mb-4'>Demand Processed!</h2>
 <p><b>Route:</b> {result.decision.route}</p>
 <p><b>Reason:</b> {result.decision.reason}</p>
 <p><b>Domain:</b> {result.classification.domain}</p>
 <p><b>Priority:</b> {result.classification.priority}</p>
 <p><b>Risk:</b> {result.tracking.risk_flag}</p>
 <p><b>Team:</b> {result.resource.team?.map(m=>m.name).join(', ')}</p>
 <button onClick={onSubmit} className='mt-6 px-4 py-2 bg-blue-700 text-white
rounded'>
 Go to Dashboard
 </button>
 </div>
 )
 return (
 <div className='p-8 max-w-2xl mx-auto'>
 <h2 className='text-2xl font-bold mb-6'>Submit AI Demand</h2>
 {['title','submitter','bu'].map(f => (
 <div key={f} className='mb-4'>
 <label className='block text-sm font-medium capitalize mb-1'>{f}</label>
 <input className='w-full border rounded px-3 py-2' value={form[f]}
 onChange={e=>setForm({...form,[f]:e.target.value})} />
 </div>
 ))}
 <div className='mb-4'>
 <label className='block text-sm font-medium mb-1'>Description</label>
 <textarea className='w-full border rounded px-3 py-2 h-32'
 value={form.description}
onChange={e=>setForm({...form,description:e.target.value})} />
 </div>
 <button disabled={loading} onClick={submit}
 className='px-6 py-2 bg-blue-800 text-white rounded font-semibold'>
 {loading ? 'Processing by AI...' : 'Submit Demand'}
 </button>
 </div>
 )
}
