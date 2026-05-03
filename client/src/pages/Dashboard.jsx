// client/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
const STAGES = ['INTAKE','CLASSIFIED','ASSIGNED','IN_PROGRESS','DONE']
const RISK_COLOR = { GREEN:'text-green-700', AMBER:'text-yellow-600', RED:'text-red700' }
export default function Dashboard({ onSelect }) {
 const [demands, setDemands] = useState([])
 useEffect(() => {
 axios.get('http://localhost:5000/api/demand').then(r => setDemands(r.data))
 }, [])
 return (
 <div className='p-6'>
 <h2 className='text-2xl font-bold mb-6'>Demand Pipeline</h2>
 <div className='grid grid-cols-5 gap-4'>
 {STAGES.map(stage => (
 <div key={stage} className='bg-white rounded shadow p-3'>
 <h3 className='font-bold text-sm text-blue-800 mb-3'>{stage}</h3>
 {demands.filter(d=>d.stage===stage).map(d=>(
 <div key={d.id} onClick={()=>onSelect(d.id)}
 className='mb-2 p-2 bg-gray-50 rounded border cursor-pointer
hover:border-blue-400'>
 <p className='text-sm font-medium'>{d.title}</p>
 <p className='text-xs text-gray-500'>{d.domain} · {d.priority}</p>
 <p className={`text-xs font-bold $
{RISK_COLOR[d.risk_flag]}`}>{d.risk_flag}</p>
 </div>
 ))}
 </div>
 ))}
 </div>
 </div>
 )
}