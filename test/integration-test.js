/**
 * @file integration-test.js
 * @description Integration test for Phase 1 + Phase 2 unified orchestration system
 * @version 1.0.0
 * @author Claude (Anthropic AI)
 * @date 2025-07-17
 */

const logger = require('../src/utils/logger');
const orchestrationController = require('../src/core/OrchestrationController');

/**
 * Integration testing suite for unified orchestration system
 */
class OrchestrationIntegrationTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    /**
     * Run comprehensive integration tests
     */
    async runAllTests() {
        logger.info('🧪 Starting Orchestration Integration Tests...');
        
        try {
            await this.testInitialization();
            await this.testPerformanceLayer();
            await this.testResilienceLayer();
            await this.testUnifiedOperation();
            await this.testSystemStatus();
            await this.testOptimization();
            await this.testShutdown();
            
            this.printResults();
            
        } catch (error) {
            logger.error('💥 Integration test suite failed:', error);
            return false;
        }
        
        return this.testResults.failed === 0;
    }

    /**
     * Test orchestration controller initialization
     */
    async testInitialization() {
        const testName = 'OrchestrationController Initialization';
        this.testResults.total++;
        
        try {
            const success = await orchestrationController.initialize();
            
            if (success && orchestrationController.isInitialized) {
                this.recordSuccess(testName, 'Controller initialized successfully');
            } else {
                this.recordFailure(testName, 'Initialization returned false or controller not marked as initialized');
            }
            
        } catch (error) {
            this.recordFailure(testName, `Initialization failed: ${error.message}`);
        }
    }

    /**
     * Test performance layer functionality
     */
    async testPerformanceLayer() {
        const testName = 'Performance Layer Integration';
        this.testResults.total++;
        
        try {
            const performanceController = orchestrationController.getPerformanceController();
            
            if (!performanceController) {
                this.recordFailure(testName, 'Performance controller not available');
                return;
            }
            
            const status = await performanceController.getStatus();
            
            if (status.isInitialized && status.componentsStatus) {
                this.recordSuccess(testName, `Performance layer operational: ${JSON.stringify(status.componentsStatus)}`);
            } else {
                this.recordFailure(testName, 'Performance layer not properly initialized');
            }
            
        } catch (error) {
            this.recordFailure(testName, `Performance layer test failed: ${error.message}`);
        }
    }

    /**
     * Test resilience layer functionality
     */
    async testResilienceLayer() {
        const testName = 'Resilience Layer Integration';
        this.testResults.total++;
        
        try {
            const resilienceController = orchestrationController.getResilienceController();
            
            if (!resilienceController) {
                this.recordFailure(testName, 'Resilience controller not available');
                return;
            }
            
            const status = await resilienceController.getStatus();
            
            if (status.isInitialized) {
                this.recordSuccess(testName, `Resilience layer operational: ${status.overallHealth}`);
            } else {
                this.recordFailure(testName, 'Resilience layer not properly initialized');
            }
            
        } catch (error) {
            this.recordFailure(testName, `Resilience layer test failed: ${error.message}`);
        }
    }

    /**
     * Test unified operation execution
     */
    async testUnifiedOperation() {
        const testName = 'Unified Operation Execution';
        this.testResults.total++;
        
        try {
            // Mock operation for testing
            const mockOperation = async (context) => {
                await this.sleep(100); // Simulate work
                return `Processed: ${context.testData}`;
            };
            
            const result = await orchestrationController.executeOperation(
                mockOperation,
                { testData: 'integration-test-data' }
            );
            
            if (result.success && result.result.includes('integration-test-data')) {
                this.recordSuccess(testName, `Operation executed successfully: ${result.metrics.responseTime}ms`);
            } else {
                this.recordFailure(testName, `Operation failed or returned unexpected result: ${JSON.stringify(result)}`);
            }
            
        } catch (error) {
            this.recordFailure(testName, `Unified operation test failed: ${error.message}`);
        }
    }

    /**
     * Test system status reporting
     */
    async testSystemStatus() {
        const testName = 'System Status Reporting';
        this.testResults.total++;
        
        try {
            const systemStatus = await orchestrationController.getSystemStatus();
            
            const requiredFields = ['isInitialized', 'uptime', 'metrics', 'performance', 'resilience'];
            const missingFields = requiredFields.filter(field => !systemStatus.hasOwnProperty(field));
            
            if (missingFields.length === 0) {
                this.recordSuccess(testName, `All status fields present. System health: ${systemStatus.metrics.systemHealth}`);
            } else {
                this.recordFailure(testName, `Missing status fields: ${missingFields.join(', ')}`);
            }
            
        } catch (error) {
            this.recordFailure(testName, `System status test failed: ${error.message}`);
        }
    }

    /**
     * Test system optimization
     */
    async testOptimization() {
        const testName = 'System Optimization';
        this.testResults.total++;
        
        try {
            const optimizationResults = await orchestrationController.optimizeSystem();
            
            if (optimizationResults.performance && optimizationResults.resilience) {
                this.recordSuccess(testName, `Optimization completed successfully`);
            } else {
                this.recordFailure(testName, `Optimization incomplete: ${JSON.stringify(optimizationResults)}`);
            }
            
        } catch (error) {
            this.recordFailure(testName, `Optimization test failed: ${error.message}`);
        }
    }

    /**
     * Test graceful shutdown
     */
    async testShutdown() {
        const testName = 'Graceful Shutdown';
        this.testResults.total++;
        
        try {
            const success = await orchestrationController.shutdown();
            
            if (success && !orchestrationController.isInitialized) {
                this.recordSuccess(testName, 'System shutdown successfully');
            } else {
                this.recordFailure(testName, 'Shutdown failed or system still marked as initialized');
            }
            
        } catch (error) {
            this.recordFailure(testName, `Shutdown test failed: ${error.message}`);
        }
    }

    /**
     * Record successful test
     */
    recordSuccess(testName, details) {
        this.testResults.passed++;
        this.testResults.details.push({
            test: testName,
            status: 'PASSED',
            details
        });
        logger.info(`✅ ${testName}: PASSED - ${details}`);
    }

    /**
     * Record failed test
     */
    recordFailure(testName, details) {
        this.testResults.failed++;
        this.testResults.details.push({
            test: testName,
            status: 'FAILED',
            details
        });
        logger.error(`❌ ${testName}: FAILED - ${details}`);
    }

    /**
     * Print comprehensive test results
     */
    printResults() {
        const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
        
        logger.info('🧪 =============== INTEGRATION TEST RESULTS ===============');
        logger.info(`📊 Total Tests: ${this.testResults.total}`);
        logger.info(`✅ Passed: ${this.testResults.passed}`);
        logger.info(`❌ Failed: ${this.testResults.failed}`);
        logger.info(`📈 Success Rate: ${successRate}%`);
        
        if (this.testResults.failed === 0) {
            logger.info('🎉 ALL TESTS PASSED! Phase 1 + Phase 2 integration successful!');
        } else {
            logger.error('💥 SOME TESTS FAILED! Review integration issues above.');
        }
        
        logger.info('🧪 ====================================================');
    }

    /**
     * Utility sleep function
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for external use
module.exports = OrchestrationIntegrationTest;

// Run tests if executed directly
if (require.main === module) {
    const testSuite = new OrchestrationIntegrationTest();
    testSuite.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            logger.error('Test suite execution failed:', error);
            process.exit(1);
        });
}
