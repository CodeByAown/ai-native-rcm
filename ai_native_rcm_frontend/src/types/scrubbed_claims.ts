    //    "patient_id": null,
    //     "operative_report": "Attached",
    //     "id": 1,
    //     "physician_signature": "Dr. Smith",
    //     "status": "Issues Found",
    //     "updated_at": "2025-09-05 12:41:23.959226+00",
    //     "diagnosis_code": "M17.11",
    //     "procedure_code": "27447",
    //     "pre_op_clearance": "Attached",
    //     "created_at": "2025-09-05 12:41:23.959226+00",
    //     "workflow_run_id": "c15cb755-2c20-4389-8de9-7ef1b7ea2bfa"

export interface ScrubbedClaim {
    patient_id: string | null;
    operative_report: string;
    id: number;
    physician_signature: string;
    status: string;
    updated_at: string;
    diagnosis_code: string;
    procedure_code: string;
    pre_op_clearance: string;
    created_at: string;
    workflow_run_id: string;
}

export type SortField = keyof ScrubbedClaim
export type SortDirection = 'asc' | 'desc'