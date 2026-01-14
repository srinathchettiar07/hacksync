export const getComplaintsByDepartment = async (req, res) => {
    const depart = req.params.department;
    try {
        const complaints = await Complaint.find({ category: depart });
    } catch (error) {
        
    }
}