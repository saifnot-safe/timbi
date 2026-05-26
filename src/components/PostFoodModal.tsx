type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export default function PostFoodModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#fff7eb] p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#5f3d26]">
              Post food
            </h2>
            <p className="mt-1 text-sm text-[#8c6a52]">
              Help timbi feed campus :3
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-[#DA7625] transition hover:scale-110"
          >
            ×
          </button>
        </div>

        <form className="space-y-4">
          <input className="timbi-input" placeholder="food name" />
          <input className="timbi-input" placeholder="location" />
          <input className="timbi-input" placeholder="ends at" />
          <textarea
            className="timbi-input min-h-24 resize-none"
            placeholder="extra details"
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#ff9f05] px-6 py-4 font-bold text-white shadow-md transition hover:scale-[1.02]"
          >
            submit report
          </button>
        </form>
      </div>
    </div>
    );
}