type Prediction = {
  student_id: number;
  risk_level: string;
  date: string;
};

type Intervention = {
  student_id: number;
  teacher_id: number;
  date: string;
};

type Props = {
  prediction: Prediction;
  intervention: Intervention;
};

function AdminRecentActivity({
  prediction,
  intervention,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Latest Prediction */}
      <div className="rounded-lg border border-gray-200 p-5">
        <h3 className="mb-4 text-lg font-semibold">
          Latest Prediction
        </h3>

        <div className="space-y-2">
          <p>
            <strong>Student ID:</strong>{" "}
            {prediction.student_id}
          </p>

          <p>
            <strong>Risk Level:</strong>{" "}
            {prediction.risk_level}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(prediction.date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Latest Intervention */}
      <div className="rounded-lg border border-gray-200 p-5">
        <h3 className="mb-4 text-lg font-semibold">
          Latest Intervention
        </h3>

        <div className="space-y-2">
          <p>
            <strong>Student ID:</strong>{" "}
            {intervention.student_id}
          </p>

          <p>
            <strong>Teacher ID:</strong>{" "}
            {intervention.teacher_id}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(intervention.date).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminRecentActivity;