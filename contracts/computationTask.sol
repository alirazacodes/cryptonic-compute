// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DataManager.sol";

/**
 * @dev Interface for external computation logic contracts
 */
interface IComputationLogic {
    function compute(bytes32 dataId, string calldata parameters) external returns (string memory resultCID);
}

/**
 * @title ComputationTask
 * @dev Manages computation tasks, execution, and storing results
 */
contract ComputationTaskContract {
    DataManager private dataManager;

    struct ComputationTask {
        bytes32 dataId;
        address requester;
        string parameters;
        string resultCID;
        bool isCompleted;
        bool isCancelled;
    }

    mapping(uint256 => ComputationTask) public tasks;
    uint256 private taskCount;

    event TaskCreated(uint256 taskId, bytes32 dataId, address requester, string parameters);
    event TaskCompleted(uint256 taskId, string resultCID);
    event TaskCancelled(uint256 taskId);
    event TaskExecutionFailed(uint256 taskId, string reason);

    constructor(address dataManagerAddress) {
        dataManager = DataManager(dataManagerAddress);
    }

    modifier taskExists(uint256 taskId) {
        require(taskId <= taskCount && taskId > 0, "ComputationTask: Task does not exist");
        _;
    }

    /**
     * @dev Create a new computation task
     * @param dataId bytes32 - Identifier for the data on which computation will be performed
     * @param parameters string - Additional parameters for the computation task
     */
    function createTask(bytes32 dataId, string calldata parameters) external {
        require(dataManager.checkDataExists(dataId), "ComputationTask: No data exists for this ID");
        taskCount += 1;
        tasks[taskCount] = ComputationTask(dataId, msg.sender, parameters, "", false, false);
        emit TaskCreated(taskCount, dataId, msg.sender, parameters);
    }

    /**
     * @dev Execute a computation task and store the result
     * @param taskId uint256 - Identifier of the task to be executed
     * @param computationLogic address - Address of the external contract that performs the actual computation
     */
    function executeTask(uint256 taskId, address computationLogic) external taskExists(taskId) {
        ComputationTask storage task = tasks[taskId];
        require(!task.isCompleted && !task.isCancelled, "ComputationTask: Task cannot be processed");
        try IComputationLogic(computationLogic).compute(task.dataId, task.parameters) returns (string memory resultCID) {
            task.resultCID = resultCID;
            task.isCompleted = true;
            emit TaskCompleted(taskId, task.resultCID);
        } catch (bytes memory reason) {
            emit TaskExecutionFailed(taskId, string(reason));
        }
    }

    // Optional for canceling a certain task 
    function cancelTask(uint256 taskId) external taskExists(taskId) {
        ComputationTask storage task = tasks[taskId];
        require(msg.sender == task.requester, "ComputationTask: Unauthorized cancellation");
        require(!task.isCompleted, "ComputationTask: Task already completed");
        
        task.isCancelled = true;
        emit TaskCancelled(taskId);
    }

    /**
     * @dev Retrieve the result of a computation task
     * @param taskId uint256 - Identifier of the task to check the result
     * @return resultCID string - CID of the result stored in IPFS
     */
    function getResult(uint256 taskId) external view taskExists(taskId) returns (string memory) {
        ComputationTask storage task = tasks[taskId];
        require(task.isCompleted, "ComputationTask: Task is not yet completed");
        require(!task.isCancelled, "ComputationTask: Task has been cancelled");

        return task.resultCID;
    }
}
