// client/src/pages/DemandDetail.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
export default function DemandDetail({ id, onBack }) {
 const [d, setD] = useState(null)
 useEffect(() => { axios.get(`http://localhost:5000/api/demand/$
{id}`).then(r=>setD(r.data)) }, [id])
 if (!d) return <div className='p-8'>Loading...</div>
 const team = JSON.parse(d.team || '[]')
 const skills = JSON.parse(d.required_skills || '[]')
 const advance = async () => {
 const idx = ['INTAKE','CLASSIFIED','ASSIGNED','IN_PROGRESS','DONE'].indexOf(d.stage)
 const next = ['INTAKE','CLASSIFIED','ASSIGNED','IN_PROGRESS','DONE'][idx+1]
 await axios.patch(`http://localhost:5000/api/demand/${id}/stage`, { stage: next })
 setD({ ...d, stage: next })
 }
 return (
 <div className='p-8 max-w-3xl mx-auto'>
 <button onClick={onBack} className='text-blue-700 mb-4'>← Back</button>
 <h2 className='text-2xl font-bold mb-2'>{d.title}</h2>
 <p className='text-gray-600 mb-6'>{d.description}</p>
 <div className='grid grid-cols-2 gap-4 mb-6'>
 <div className='bg-blue-50 p-4 rounded'><b>Route:</b> {d.route}</div>
 <div className='bg-blue-50 p-4 rounded'><b>Domain:</b> {d.domain}</div>
 <div className='bg-blue-50 p-4 rounded'><b>Priority:</b> {d.priority}</div>
 <div className='bg-blue-50 p-4 rounded'><b>Stage:</b> {d.stage}</div>
 <div className='bg-blue-50 p-4 rounded'><b>Risk:</b> {d.risk_flag}</div>
 <div className='bg-blue-50 p-4 rounded'><b>SLA:</b> {d.sla_days} days</div>
 </div>
 <div className='mb-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400'>
 <b>Why this route?</b><br/>{d.route_reason}
 </div>
 <div className='mb-4'><b>Required Skills:</b> {skills.join(', ')}</div>
 <div className='mb-4'>
 <b>Team:</b>
 {team.map(m=><div key={m.name} className='text-sm mt-1'>{m.name} — {m.role} (Fit:
{m.fit_score}%)</div>)}
 </div>
 <button onClick={advance} className='px-4 py-2 bg-green-700 text-white rounded'>
 Advance Stage
 </button>
 </div>
 )
}