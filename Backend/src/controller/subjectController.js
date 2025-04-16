// ... existing code ...

// Get subjects by class ID
export const getSubjectsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId || isNaN(parseInt(classId))) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid class ID provided" 
      });
    }

    const subjects = await prisma.classSubject.findMany({
      where: {
        classId: parseInt(classId),
      },
      include: {
        subject: true,
      },
    });

    const formattedSubjects = subjects.map(item => item.subject);

    return res.status(200).json({
      success: true,
      data: formattedSubjects,
    });
  } catch (error) {
    console.error("Error fetching subjects by class ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

// ... existing code ...