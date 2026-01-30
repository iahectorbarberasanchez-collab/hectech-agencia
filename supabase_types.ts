export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            automation_metrics: {
                Row: {
                    client_email: string
                    client_id: string
                    client_name: string | null
                    created_at: string | null
                    drive_folder_url: string | null
                    id: string
                    metric_type: string
                    password: string | null
                    status: string | null
                    time_saved_min: number | null
                    total_actions: number | null
                    total_time_saved: number | null
                    value: number | null
                }
                Insert: {
                    client_email: string
                    client_id?: string
                    client_name?: string | null
                    created_at?: string | null
                    drive_folder_url?: string | null
                    id?: string
                    metric_type?: string
                    password?: string | null
                    status?: string | null
                    time_saved_min?: number | null
                    total_actions?: number | null
                    total_time_saved?: number | null
                    value?: number | null
                }
                Update: {
                    client_email?: string
                    client_id?: string
                    client_name?: string | null
                    created_at?: string | null
                    drive_folder_url?: string | null
                    id?: string
                    metric_type?: string
                    password?: string | null
                    status?: string | null
                    time_saved_min?: number | null
                    total_actions?: number | null
                    total_time_saved?: number | null
                    value?: number | null
                }
                Relationships: []
            }
            clients: {
                Row: {
                    company_name: string | null
                    created_at: string
                    email: string
                    id: string
                    name: string
                    phone: string | null
                    status: string | null
                    stripe_customer_id: string | null
                }
                Insert: {
                    company_name?: string | null
                    created_at?: string
                    email: string
                    id?: string
                    name: string
                    phone?: string | null
                    status?: string | null
                    stripe_customer_id?: string | null
                }
                Update: {
                    company_name?: string | null
                    created_at?: string
                    email?: string
                    id?: string
                    name?: string
                    phone?: string | null
                    status?: string | null
                    stripe_customer_id?: string | null
                }
                Relationships: []
            }
            contracts: {
                Row: {
                    client_id: string | null
                    contract_url: string | null
                    created_at: string
                    id: string
                    signed_pdf_url: string | null
                    signwell_document_id: string | null
                    status: string | null
                }
                Insert: {
                    client_id?: string | null
                    contract_url?: string | null
                    created_at?: string
                    id?: string
                    signed_pdf_url?: string | null
                    signwell_document_id?: string | null
                    status?: string | null
                }
                Update: {
                    client_id?: string | null
                    contract_url?: string | null
                    created_at?: string
                    id?: string
                    signed_pdf_url?: string | null
                    signwell_document_id?: string | null
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "contracts_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
    }
}