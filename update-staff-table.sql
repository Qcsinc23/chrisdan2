-- Update staff_users table to support approval system
ALTER TABLE staff_users 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add foreign key constraint for approved_by
ALTER TABLE staff_users 
ADD CONSTRAINT fk_staff_approved_by 
FOREIGN KEY (approved_by) REFERENCES staff_users(id);

-- Update existing records to have approved status
UPDATE staff_users 
SET approval_status = 'approved', 
    approved_at = created_at 
WHERE approval_status IS NULL OR approval_status = '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_approval_status ON staff_users(approval_status);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff_users(role);
