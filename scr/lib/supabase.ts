import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.https://yplmkvtrrurnpvdhhmrd.supabase.co/rest/v1/!,
    supabaseKey: process.env.sb_publishable_qJWI783BOZO7xQV-wEoPvw_21xZwHou!,
  })
}
