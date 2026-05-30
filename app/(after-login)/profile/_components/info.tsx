import { motion } from "framer-motion";
import { useUserLogIn } from "hooks/context/UserLogInContext";

export default function Info() {
  const { userLogIn } = useUserLogIn();

  return (
    <motion.div
      key="info"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner mb-6">
        <img
          src={
            userLogIn?.avatarUrl?.trim()
              ? userLogIn?.avatarUrl
              : "/avatarDefault.png"
          }
          alt="Profile Avatar"
          className="w-16 h-16 rounded-full object-cover border border-gray-300"
        />
        <div>
          <p className="text-lg font-semibold">{userLogIn?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {userLogIn?.email}
          </p>

          <p className="text-sm font-semibold mt-2">Role:</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {userLogIn?.role?.name}
          </p>

          <p className="text-sm font-semibold mt-2">Team:</p>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {userLogIn?.teams?.map((team) => (
              <p key={team.id}>
                {team.name}
                {team.isLeader && " (leader)"}
              </p>
            ))}
            {userLogIn?.teams?.length === 0 && <p>-</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
